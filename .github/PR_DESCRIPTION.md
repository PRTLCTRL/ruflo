# PR for ruvnet/ruflo#1652

## Title
fix(guidance): abort ab-test when executor cannot isolate configs

## Branch
cursor/fix-ab-test-zero-delta-4d5e

## Description

## What was broken

The `ruflo guidance ab-test` command has been producing guaranteed zero-delta results because `DefaultHeadlessExecutor` _claims_ to be content-aware but can't actually isolate Config A from Config B. The executor swaps CLAUDE.md files on disk, but `claude -p` reads guidance from the repository root or cached context — not from the working directory. This means both configs read the same guidance, producing an architecturally guaranteed delta of exactly zero.

The issue is a bit like benchmarking two race cars by testing them in the same traffic jam.

## Root cause

Looking at the git history, there have been **20+ attempts** to fix this on separate branches (none merged to main). The fundamental problem:

1. `DefaultHeadlessExecutor` implements `IContentAwareExecutor` and has a `setContext` method
2. The `setContext` method triggers file-swapping logic in `execute()`
3. The executor backs up CLAUDE.md, swaps it, runs `claude -p`, then immediately restores it
4. But `claude -p` doesn't respect the swapped file — it loads guidance from elsewhere
5. Result: both configs run with the same context, delta = 0

Each benchmark run costs ~$23 (40 tasks × $0.58 per Opus 4.7 call) and 21 minutes, only to produce meaningless results.

## What changed

Implemented **Option 1** from the issue: detect and abort before wasting tokens.

### Code changes:

1. **Removed the false promise** — `DefaultHeadlessExecutor` now only implements `IHeadlessExecutor`, not `IContentAwareExecutor`
2. **Stripped out non-working logic** — removed `setContext` method and all file-swapping code from the executor
3. **Added detection** — `abBenchmark` now checks if the executor is content-aware and throws a helpful error if not
4. **Clear error message** — explains the zero-delta problem, why it happens, and what users need to do

The error now tells users exactly what's wrong and references issue #1652 so they understand this is a known limitation.

## What I tested

### What I ran:

- `npm install` from workspace root (passed)
- `npm test -- v3/@claude-flow/guidance` — **172 tests passed** for analyzer.test.ts
  - Existing A/B tests with `ABDifferentialExecutor` (content-aware) still pass
  - My new tests verify the error is thrown for non-content-aware executors
  - Tests check error message contains key information (zero-delta, Config A/B, #1652)

### What I couldn't test:

- **Full end-to-end `ruflo guidance ab-test` command** — would need `claude` CLI authenticated and working, plus a real CLAUDE.md file to test against
- **TypeScript build for the whole workspace** — many pre-existing build errors in other packages (missing workspace dependencies, etc.)
- **The actual behavior users see** — I'm confident the error will be thrown, but I haven't verified the exact formatting in a terminal

## What's still needed

This fix makes the problem **visible**, but doesn't make A/B testing **functional**. To actually get meaningful results, someone needs to:

1. Build a proper content-aware executor that injects guidance via `--append-system-prompt` or API-based context, not file swapping
2. OR find a way to make `claude -p` respect a custom CLAUDE.md location
3. OR use a completely different testing approach (maybe spawn full Claude Code sessions?)

This PR prevents users from wasting money and time on broken benchmarks. Actually _fixing_ the feature is a bigger lift.

## Notes

- The 20+ fix attempts in git history suggest this problem is harder than it looks
- File swapping doesn't work because `claude -p` caches or loads guidance at startup
- The error message is deliberately verbose — users need to understand _why_ this fails

Fixes ruvnet/ruflo#1652

---

I'm trying to get more involved with this project — happy to iterate on this if anything looks off.
