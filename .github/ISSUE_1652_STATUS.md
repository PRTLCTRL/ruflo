# Issue #1652 Status: Already Fixed

## Summary

Issue #1652 reported that `ruflo guidance ab-test` with `DefaultHeadlessExecutor` produced guaranteed zero-delta results because the executor couldn't swap CLAUDE.md between Config A and Config B.

**Status: FIXED** in commit `c2c21f6ae` (April 28, 2026) as part of v3.6.7.

## What Was Fixed

The `DefaultHeadlessExecutor` class in `v3/@claude-flow/guidance/src/analyzer.ts` was updated to:

1. **Implement `IContentAwareExecutor` interface** — added `setContext()` method
2. **Physically swap CLAUDE.md files** — backs up, replaces, and restores CLAUDE.md around each execution
3. **Properly isolate configs** — Config A (empty context) vs Config B (with guidance content)

### Before (v3.0.0-alpha.1)
```typescript
class DefaultHeadlessExecutor implements IHeadlessExecutor {
  async execute(prompt: string, workDir: string) {
    // Just ran `claude -p` — both configs read same on-disk CLAUDE.md
    // Result: guaranteed delta of +0
  }
}
```

### After (v3.0.0-alpha.2+)
```typescript
class DefaultHeadlessExecutor implements IContentAwareExecutor {
  private contextContent: string | null = null;

  setContext(claudeMdContent: string): void {
    this.contextContent = claudeMdContent;
  }

  async execute(prompt: string, workDir: string) {
    // Backs up original CLAUDE.md
    // For Config A (empty string): deletes CLAUDE.md
    // For Config B (content): writes new CLAUDE.md
    // Runs `claude -p` with isolated context
    // Restores original CLAUDE.md
  }
}
```

## Test Coverage

Comprehensive test coverage was added in commits:
- `7931501e6` (May 4, 2026) — Initial test coverage
- `450ebeb1a` (May 4, 2026) — Additional explicit verification

Tests verify:
- `DefaultHeadlessExecutor` properly implements `IContentAwareExecutor`
- `setContext('')` simulates Config A (no guidance)
- `setContext(content)` simulates Config B (with guidance)
- `isContentAwareExecutor()` type guard works correctly
- `abBenchmark()` produces measurable deltas (not zero)

## Current Status

- **Fix**: ✅ Merged to `main` (commit `c2c21f6ae`)
- **Tests**: ✅ Available in branch `fix/issue-1652-6685`
- **Version**: Bumped to `3.0.0-alpha.2` in package.json
- **Published**: ⏳ **Awaiting npm publish**

## For Users

If you're seeing zero deltas with `ruflo guidance ab-test`:

1. **Check your version**: `npm list @claude-flow/guidance`
2. **If you're on v3.0.0-alpha.1**: The fix is available but not yet published
3. **Workaround**: Install from git until next publish:
   ```bash
   npm install ruvnet/ruflo#main
   ```
4. **Future**: Next npm publish of `@claude-flow/guidance` will include the fix

## Timeline

| Date | Event |
|------|-------|
| 2026-04-28 | Fix committed (`c2c21f6ae`) |
| 2026-04-28 | Version bumped to `3.0.0-alpha.2` |
| 2026-05-04 | Test coverage added (`7931501e6`, `450ebeb1a`) |
| 2026-05-04 | Issue #1652 opened (user on v3.0.0-alpha.1) |
| TBD | Publish `@claude-flow/guidance@3.0.0-alpha.2` to npm |

## Root Cause Analysis

The original implementation violated the isolation principle: both Config A and Config B ran `claude -p` in the same `workDir`, which caused Claude Code to automatically load the on-disk `CLAUDE.md` regardless of what the test harness intended. This created a false-positive test where both configurations had identical context.

The fix properly isolates the two configs by physically manipulating the filesystem state before each execution, ensuring Config A truly runs without guidance while Config B runs with it.

## Cost Savings

The fix also prevents wasted spending. The reporter noted:
- Default benchmark: 20 tasks × 2 configs = 40 `claude -p` calls
- Each call: ~92K cache-creation tokens (~$0.58 on Opus 4.7)
- Total cost per run: **~$23 for guaranteed zero result**

With the fix, users only run benchmarks when they'll get actionable data.

---

**Closes #1652**
