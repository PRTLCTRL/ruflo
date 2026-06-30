# Issue #1652: AB-Test Default Executor Fix Status

## Summary

**The fix for this issue is ALREADY IMPLEMENTED in the source code.** The problem only exists in the published npm package version `3.0.0-alpha.1`. The current source code (version `3.0.0-alpha.2`, unpublished) contains the complete fix.

## Problem Description

In the published `@claude-flow/guidance@3.0.0-alpha.1`, the `DefaultHeadlessExecutor` class did not implement content-awareness, meaning that `ruflo guidance ab-test` could not actually compare "Config A (no CLAUDE.md)" vs "Config B (with CLAUDE.md)". Both configs would read the same on-disk CLAUDE.md file, resulting in a guaranteed zero delta.

## Current Implementation (v3.0.0-alpha.2, unpublished)

The fix is implemented in `v3/@claude-flow/guidance/src/analyzer.ts` lines 608-657:

### Key Components

1. **IContentAwareExecutor Implementation** (line 608)
   ```typescript
   class DefaultHeadlessExecutor implements IContentAwareExecutor
   ```

2. **setContext Method** (lines 611-613)
   ```typescript
   setContext(claudeMdContent: string): void {
     this.contextContent = claudeMdContent;
   }
   ```

3. **File-Swapping Logic** (lines 626-635)
   - Backs up existing CLAUDE.md to `.CLAUDE.md.ab-backup`
   - For Config B: writes the provided content to CLAUDE.md
   - For Config A: deletes CLAUDE.md (empty string passed to setContext)

4. **Cleanup in Finally Block** (lines 647-655)
   - Restores original CLAUDE.md from backup
   - Removes backup file
   - Handles errors gracefully

## How abBenchmark Uses It

In `abBenchmark()` function (lines 3116-3150):

```typescript
const contentAware = isContentAwareExecutor(executor);

// Config A: No control plane
if (contentAware) executor.setContext('');  // Deletes CLAUDE.md
const configAResults = await runABConfig(executor, tasks, workDir);

// Config B: With Phase 1 control plane
if (contentAware) executor.setContext(claudeMdContent);  // Writes CLAUDE.md
const configBResults = await runABConfig(executor, tasks, workDir);
```

Since `DefaultHeadlessExecutor` now implements `IContentAwareExecutor`, the `isContentAwareExecutor()` type guard returns `true`, and the `setContext()` calls actually execute.

## Verification

Run `node test-ab-fix.mjs` to verify:
- ✅ DefaultHeadlessExecutor implements IContentAwareExecutor
- ✅ setContext() method exists and works
- ✅ File-swapping logic is implemented
- ✅ Backup/restore mechanism is in finally block

## What Needs to Happen

1. **Publish the current source** to npm as `@claude-flow/guidance@3.0.0-alpha.2` (or later)
2. **Update the CLI package** to depend on the new version
3. **Publish ruflo** with the updated dependency

## For Users Experiencing This Issue

**Workaround until published:**
- Clone this repository
- Build locally: `cd v3/@claude-flow/guidance && npm install && npm run build`
- Use the local build

**Once Published:**
- Update to `@claude-flow/guidance@3.0.0-alpha.2` or later
- Run `npm update @claude-flow/guidance`
- Run `ruflo guidance ab-test` again

## Cost Savings

The fix prevents users from spending ~$23 (40 calls × $0.58/call on Opus 4.7) on a benchmark that was guaranteed to produce zero delta due to the architectural limitation.

## Testing

The existing test suite in `v3/@claude-flow/guidance/tests/analyzer.test.ts` lines 2077-2468 thoroughly tests the AB benchmark functionality with the `ABDifferentialExecutor` mock, which properly implements `IContentAwareExecutor`.

To add a test specifically for the DefaultHeadlessExecutor's file-swapping behavior, one would need to:
1. Create a temporary directory
2. Write a CLAUDE.md file
3. Create a DefaultHeadlessExecutor
4. Call setContext('') and verify CLAUDE.md is deleted
5. Call setContext('new content') and verify CLAUDE.md is written
6. Clean up

However, this would require mocking the `claude` CLI or having it installed, which is beyond the scope of a unit test.

## Conclusion

**No code changes are needed.** The issue is resolved in the current source code. This PR serves as documentation of the fix and verification that it's implemented correctly. Once published to npm, users will automatically get the fix when they update.
