# Issue #1652: Status and Resolution

## Summary

**Issue**: `ruflo guidance ab-test` with the default `DefaultHeadlessExecutor` could not swap CLAUDE.md between Config A (no guidance) and Config B (with guidance), resulting in architecturally guaranteed zero deltas.

**Status**: ✅ **FIXED in source** (commit `c2c21f6ae`, 2026-04-28)

**Remaining work**: Package needs to be published to npm with version bump.

## Root Cause

The original `DefaultHeadlessExecutor` did not implement `IContentAwareExecutor`, so the `isContentAwareExecutor()` check in `abBenchmark()` returned `false`. This meant both `setContext('')` calls (Config A and Config B) were skipped, causing both configs to read the same on-disk CLAUDE.md file.

```typescript
// OLD CODE (broken):
class DefaultHeadlessExecutor implements IHeadlessExecutor {
  async execute(prompt: string, workDir: string) {
    // Always runs claude -p with whatever CLAUDE.md exists in workDir
    // No way to isolate Config A from Config B
  }
}
```

## The Fix

Commit `c2c21f6ae` (2026-04-28) made `DefaultHeadlessExecutor` implement `IContentAwareExecutor` with proper file swapping:

```typescript
// NEW CODE (fixed):
class DefaultHeadlessExecutor implements IContentAwareExecutor {
  private contextContent: string | null = null;

  setContext(claudeMdContent: string): void {
    this.contextContent = claudeMdContent;
  }

  async execute(prompt: string, workDir: string) {
    const claudeMdPath = join(workDir, 'CLAUDE.md');
    const backupPath = join(workDir, '.CLAUDE.md.ab-backup');

    // Backup original file
    if (this.contextContent !== null) {
      try { await fs.copyFile(claudeMdPath, backupPath); } catch {}

      // Config A: empty string → remove CLAUDE.md
      // Config B: content provided → write it
      if (this.contextContent.length > 0) {
        await fs.writeFile(claudeMdPath, this.contextContent, 'utf-8');
      } else {
        await fs.unlink(claudeMdPath).catch(() => {});
      }
    }

    // Run claude -p
    const { stdout, stderr } = await execFileAsync('claude', ['-p', prompt, ...]);

    // Restore original file
    if (swapped) {
      await fs.copyFile(backupPath, claudeMdPath);
      await fs.unlink(backupPath);
    }

    return { stdout, stderr, exitCode: 0 };
  }
}
```

## Verification

The fix is confirmed to be present in `v3/@claude-flow/guidance/src/analyzer.ts`:

- ✅ Line 608: `class DefaultHeadlessExecutor implements IContentAwareExecutor`
- ✅ Line 611-613: `setContext(claudeMdContent: string): void` method
- ✅ Lines 626-635: File swapping logic (write Config B content or remove for Config A)
- ✅ Lines 647-654: Backup/restore in finally block

Test coverage was added in the test suite (`analyzer.test.ts`):
- `ABDifferentialExecutor` mock demonstrates expected behavior
- Tests verify Config B outperforms Config A across multiple task classes
- Gate simulation detects violations correctly

## Package Status

| Package | Current Version | Has Fix? | Published? |
|---------|----------------|----------|------------|
| `@claude-flow/guidance` | 3.0.0-alpha.2 | ✅ Yes | ❌ No |

The fix is in the source but the package hasn't been published to npm yet. Users running `npm install @claude-flow/guidance` or `npm install -g ruflo` will still get the broken 3.0.0-alpha.1 version.

## Next Steps

1. ✅ Fix implemented (commit `c2c21f6ae`)
2. ✅ Tests added (`analyzer.test.ts` lines 1887-2468)
3. ⏳ **TODO**: Publish `@claude-flow/guidance@3.0.0-alpha.2` to npm
4. ⏳ **TODO**: Publish `ruflo@3.6.8+` (or next version) to npm
5. ⏳ **TODO**: Close issue #1652 after publishing

## Testing the Fix

To verify the fix works:

```bash
# From project root
cd v3/@claude-flow/guidance
npm test -- analyzer.test.ts -t "abBenchmark"

# Expected: All A/B benchmark tests pass
# - Config B beats Config A in composite score
# - Config B has fewer violations than Config A
# - Config B has higher per-class success rates
```

## Cost/Time Savings

With the fix:
- Default benchmark: ~$23, ~21 minutes → produces meaningful deltas
- Without fix: Same cost/time → always produces zero delta (wasted spend)

The fix eliminates silent zero-delta results that misled users into thinking their CLAUDE.md was ineffective.

## References

- Original issue: https://github.com/ruvnet/ruflo/issues/1652
- Fix commit: c2c21f6ae (2026-04-28)
- Package location: `v3/@claude-flow/guidance/`
- Test location: `v3/@claude-flow/guidance/tests/analyzer.test.ts`
