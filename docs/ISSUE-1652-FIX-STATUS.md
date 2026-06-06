# Issue #1652 Fix Status

## TL;DR

Issue #1652 is **FIXED in source code** (since 2026-04-28) but **not yet published to npm**. Users experiencing zero-delta `ab-test` results are using the outdated published version (`3.0.0-alpha.1`). The fix exists in `main` at version `3.0.0-alpha.2` and is ready for publication.

---

## Problem Summary

`ruflo guidance ab-test` with the default `DefaultHeadlessExecutor` was producing **guaranteed zero-delta results** because both Config A and Config B read the same on-disk `CLAUDE.md` file. The executor couldn't actually swap the guidance context between configurations, making the benchmark architecturally incapable of measuring the control plane's effect.

**Root Cause:** The published npm version (`@claude-flow/guidance@3.0.0-alpha.1`) has a `DefaultHeadlessExecutor` that:
- Does NOT implement `IContentAwareExecutor`
- Does NOT have a `setContext()` method
- Cannot isolate Config A (no guidance) from Config B (with guidance)

Result: Both configs execute with identical context → delta always = 0

---

## The Fix

**Commit:** `c2c21f6ae` (2026-04-28, part of v3.6.7)  
**File:** `v3/@claude-flow/guidance/src/analyzer.ts`

### Changes Made

1. **`DefaultHeadlessExecutor` now implements `IContentAwareExecutor`**

```typescript
// BEFORE (alpha.1) - NOT content-aware
class DefaultHeadlessExecutor implements IHeadlessExecutor {
  async execute(prompt: string, workDir: string) {
    // Just runs `claude -p` — both configs see same CLAUDE.md
  }
}

// AFTER (alpha.2+) - Content-aware with file swapping
class DefaultHeadlessExecutor implements IContentAwareExecutor {
  private contextContent: string | null = null;

  setContext(claudeMdContent: string): void {
    this.contextContent = claudeMdContent;
  }

  async execute(prompt: string, workDir: string) {
    // Backs up original CLAUDE.md
    // For Config A (empty): deletes CLAUDE.md
    // For Config B (content): writes provided content
    // Runs `claude -p` with isolated context
    // Restores original CLAUDE.md
  }
}
```

2. **Physical File Swapping Logic**
   - **Config A** (baseline): `setContext('')` → `CLAUDE.md` deleted → Claude runs without guidance
   - **Config B** (with control plane): `setContext(claudeMdContent)` → `CLAUDE.md` replaced → Claude runs with guidance
   - **Cleanup**: Original `CLAUDE.md` backed up to `.CLAUDE.md.ab-backup` and restored after each run

3. **Type Guard Already Correct**
   
```typescript
function isContentAwareExecutor(executor: IHeadlessExecutor): executor is IContentAwareExecutor {
  return 'setContext' in executor && typeof executor.setContext === 'function';
}
```

This correctly identifies `DefaultHeadlessExecutor` as content-aware in the fixed version.

---

## Test Coverage

### Existing Tests (Using Mock Executor)

The test file `v3/@claude-flow/guidance/tests/analyzer.test.ts` has 172 comprehensive tests for `abBenchmark`, but they all use a **mock executor** (`ABDifferentialExecutor`) that simulates content-aware behavior. The mock was passing, but the real default executor wasn't tested.

### New Tests (This PR)

Added 5 new tests specifically for `DefaultHeadlessExecutor`:

```typescript
describe('Default executor (DefaultHeadlessExecutor) integration', () => {
  it('uses DefaultHeadlessExecutor when no executor specified')
  it('DefaultHeadlessExecutor is content-aware and produces measurable deltas')
  it('DefaultHeadlessExecutor can run with minimal CLAUDE.md content')
  it('DefaultHeadlessExecutor handles empty content without crashing')
  it('DefaultHeadlessExecutor properly isolates Config A from Config B')
});
```

**Result:** All 177 tests pass ✅

---

## Current Status

| Aspect | Status |
|--------|--------|
| **Fix in Source** | ✅ Done (commit `c2c21f6ae`, 2026-04-28) |
| **Tests Added** | ✅ Done (this PR, 5 new tests) |
| **Package Version** | 📦 `3.0.0-alpha.2` (in `package.json`, not published) |
| **Published on npm** | ❌ Still at `3.0.0-alpha.1` (broken version) |
| **Build Status** | ⚠️ Workspace dependency issues (pre-existing, unrelated) |

---

## For Users Experiencing the Bug

If you're seeing zero-delta results with `ruflo guidance ab-test`, you're using the outdated npm package. Here are your options:

### Option 1: Install from GitHub (Recommended)

```bash
npm uninstall -g ruflo @claude-flow/guidance
npm install -g ruvnet/ruflo#main
```

This installs directly from the `main` branch where the fix exists.

### Option 2: Wait for npm Publish

The maintainers need to publish `@claude-flow/guidance@3.0.0-alpha.2` to npm. Once published:

```bash
npm update -g ruflo
```

### Option 3: Use a Custom Content-Aware Executor

If you can't update, provide your own executor:

```typescript
import { abBenchmark, IContentAwareExecutor } from '@claude-flow/guidance/analyzer';

class MyExecutor implements IContentAwareExecutor {
  private context: string | null = null;
  
  setContext(content: string) { this.context = content; }
  
  async execute(prompt: string, workDir: string) {
    // Your implementation that actually isolates configs
  }
}

const report = await abBenchmark(myClaudeMd, {
  executor: new MyExecutor()
});
```

---

## Why Wasn't This Caught Earlier?

1. **Mock Testing**: The existing test suite used a mock executor that correctly implemented `IContentAwareExecutor`, so tests passed even though the real default executor was broken.

2. **No Integration Tests**: There were no tests that called `abBenchmark()` without providing an executor, which would have caught that the default executor wasn't content-aware.

3. **Manual Testing Required**: The bug only manifests when running actual `claude -p` headless sessions with real CLAUDE.md files, which requires a properly configured Claude CLI installation and is expensive to run (~$23 per default benchmark suite).

This PR addresses point #2 by adding explicit integration tests for the default executor case.

---

## Verification Steps

### For Maintainers

Before publishing to npm:

1. **Run Tests**
   ```bash
   cd v3/@claude-flow/guidance
   npm test -- analyzer.test.ts
   # Expected: 177 tests pass
   ```

2. **Build Package** (once workspace deps are fixed)
   ```bash
   cd v3/@claude-flow/guidance
   npm run build
   # Should produce dist/ directory with compiled code
   ```

3. **Manual Integration Test** (optional, requires Claude CLI)
   ```bash
   cd /tmp/test-repo
   echo "# Test Rules\n\n- NEVER commit secrets" > CLAUDE.md
   ruflo guidance ab-test --tasks ./minimal-tasks.json
   # Expected: Non-zero delta (not +0)
   ```

4. **Publish**
   ```bash
   cd v3/@claude-flow/guidance
   npm publish --tag v3alpha
   npm dist-tag add @claude-flow/guidance@3.0.0-alpha.2 latest
   ```

### For Issue Reporter

Once published, verify the fix:

```bash
npm update -g ruflo
ruflo --version  # Should show 3.0.0-alpha.2 or higher

cd /path/to/your/repo
ruflo guidance ab-test

# Expected output:
# Composite Scores
#   Config A: <some score>
#   Config B: <some score>
#   Delta:    <non-zero delta>
# Verdict: Config B is better (or similar)
```

---

## Related Commits

- `c2c21f6ae` - Original fix (2026-04-28)
- `0ca30d816` - Documentation (on separate branch)
- `c60f37aa8` - This PR: test coverage

---

## Summary

The bug reported in issue #1652 is **already fixed in the source code**. The problem is that:
1. The fix hasn't been published to npm yet
2. There was no test coverage specifically for the default executor case

This PR adds the missing test coverage. The next step is **publishing the package to npm** so users can access the fix.
