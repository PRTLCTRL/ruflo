# Issue #1652 Resolution: ab-test Default Executor Now Content-Aware

## Summary

Issue #1652 reported that `ruflo guidance ab-test` with the default `DefaultHeadlessExecutor` could not swap CLAUDE.md between Config A (baseline) and Config B (with guidance), resulting in guaranteed zero-delta comparisons.

**Status**: ✅ **RESOLVED** as of commit `c2c21f6ae` (2026-04-28)

## The Fix

The `DefaultHeadlessExecutor` class was enhanced to properly implement `IContentAwareExecutor` with the following changes:

### Implementation (v3/@claude-flow/guidance/src/analyzer.ts:608-657)

```typescript
class DefaultHeadlessExecutor implements IContentAwareExecutor {
  private contextContent: string | null = null;

  setContext(claudeMdContent: string): void {
    this.contextContent = claudeMdContent;
  }

  async execute(prompt: string, workDir: string): Promise<...> {
    // Swap CLAUDE.md on disk based on context
    if (this.contextContent !== null) {
      // Backup existing CLAUDE.md
      await fs.copyFile(claudeMdPath, backupPath);
      
      if (this.contextContent.length > 0) {
        // Config B: Write guidance content
        await fs.writeFile(claudeMdPath, this.contextContent, 'utf-8');
      } else {
        // Config A: Remove CLAUDE.md (no guidance)
        await fs.unlink(claudeMdPath).catch(() => {});
      }
    }
    
    // Execute claude -p with the modified environment
    const { stdout, stderr } = await execFileAsync('claude', ['-p', prompt, ...]);
    
    // Restore original CLAUDE.md
    if (swapped) {
      await fs.copyFile(backupPath, claudeMdPath);
      await fs.unlink(backupPath);
    }
    
    return { stdout, stderr, exitCode: 0 };
  }
}
```

### How It Works

1. **Config A (Baseline - No Guidance)**:
   - `setContext('')` is called
   - Executor removes `CLAUDE.md` before running tasks
   - Agent runs without guidance rules

2. **Config B (With Guidance)**:
   - `setContext(claudeMdContent)` is called
   - Executor writes guidance to `CLAUDE.md` before running tasks
   - Agent runs with guidance active

3. **Isolation**:
   - Original `CLAUDE.md` is backed up
   - Each config gets a clean execution environment
   - File is restored after benchmark completes

## Affected Versions

- **Broken**: `@claude-flow/guidance` v3.0.0-alpha.1 and earlier
- **Fixed**: `@claude-flow/guidance` v3.0.0-alpha.2 and later
- **Fix commit**: `c2c21f6ae558e5cc73f2b0bea8f10d0989dbbe42`

## Verification

The fix has been verified through:

1. **Unit tests** (added in commit `450ebeb1a`):
   - DefaultHeadlessExecutor implements IContentAwareExecutor
   - setContext properly stores context for execution
   - abBenchmark produces measurable deltas

2. **Integration behavior**:
   - Config A and Config B now produce different composite scores
   - Violations are properly detected in Config A (no guidance)
   - Config B shows reduced violations when guidance is present

## For Users Experiencing This Issue

### Quick Fix: Upgrade to Latest Version

```bash
# Upgrade to alpha.2 or later
npm install -g ruflo@latest
npm install @claude-flow/guidance@3.0.0-alpha.2
```

### Verify the Fix

After upgrading, run a simple ab-test:

```bash
# Create a test CLAUDE.md with a simple rule
echo '## Rules\n- Never use force push' > CLAUDE.md

# Run ab-test
ruflo guidance ab-test

# Expected: Delta should be non-zero
# Config A will allow force push
# Config B will block it due to the rule
```

You should now see meaningful deltas like:

```
Composite Scores
  Config A: 0.612
  Config B: 0.847
  Delta:    +0.235
Verdict: Config B shows significant improvement.
```

## Cost Savings

With the fix applied, users can now:
- Get accurate A/B comparisons without zero-delta false negatives
- Validate their CLAUDE.md guidance rules effectively
- Justify the ~$23 cost per 20-task benchmark suite

## Related Commits

- `c2c21f6ae`: Initial fix implementation
- `450ebeb1a`: Added test coverage for DefaultHeadlessExecutor
- `7931501e6`: Additional explicit content-awareness tests
- `0ca30d816`: Documentation of fix status

## Technical Details

The original issue occurred because:

1. `DefaultHeadlessExecutor` was exported but didn't implement `IContentAwareExecutor`
2. `isContentAwareExecutor()` type guard returned `false` for default executor
3. Both Config A and Config B called `executor.execute()` with the same on-disk `CLAUDE.md`
4. No environment isolation = guaranteed zero delta

The fix properly implements the `IContentAwareExecutor` interface and physically swaps the file on disk before each execution, ensuring true isolation between configs.

## References

- Original issue: https://github.com/ruvnet/ruflo/issues/1652
- Fix commit: https://github.com/ruvnet/ruflo/commit/c2c21f6ae
- Test commit: https://github.com/ruvnet/ruflo/commit/450ebeb1a
