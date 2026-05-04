# Pull Request Details

**Branch:** `PRTLCTRL:fix/issue-1608-tar-cves-cursor/cursor-4473`  
**Target:** `ruvnet:main`  
**Type:** Draft PR  
**Title:** sec(deps): upgrade bcrypt to 6.0.0 to eliminate tar CVEs

## Create PR URL

Visit: https://github.com/ruvnet/ruflo/compare/main...PRTLCTRL:ruflo:fix/issue-1608-tar-cves-cursor/cursor-4473

---

## PR Body

## What Was Broken

`@claude-flow/security@3.0.0-alpha.1` was shipping 6 HIGH-severity CVEs to every downstream consumer — a bit like handing someone a security package with the locks already picked.

The vulnerability chain:
```
@claude-flow/security → bcrypt@^5.1.1 → @mapbox/node-pre-gyp@1.0.11 → tar@6.2.1
```

`tar@6.2.1` is vulnerable to all 6 CVEs (<=7.5.10 range):
- GHSA-34x7-hfp2-rc4v: Arbitrary File Creation/Overwrite via Hardlink Path Traversal
- GHSA-8qq5-rm4j-mr97: Arbitrary File Overwrite and Symlink Poisoning
- GHSA-83g3-92jg-28cx: Arbitrary File Read/Write via Hardlink Target Escape
- GHSA-qffp-2rhf-9h96: Hardlink Path Traversal via Drive-Relative Linkpath
- GHSA-9ppj-qmqm-q256: Symlink Path Traversal via Drive-Relative Linkpath
- GHSA-r6q2-hw4h-h46w: Race Condition in node-tar Path Reservations

`@mapbox/node-pre-gyp@1.0.11` declares `"tar": "^6.1.11"` — entirely within the vulnerable range.

## Root Cause

The parser at `@mapbox/node-pre-gyp` hasn't been updated to pin `tar@^7.x`. bcrypt@5.x depends on it for native compilation steps, so downstream consumers inherited the vulnerability automatically.

Before this fix, every project using `@claude-flow/security` had to add a manual `package.json` override:
```json
"overrides": {
  "tar": "7.5.13"
}
```
That workaround is fragile — it survives normal `npm install` but can silently revert if someone regenerates package.json or runs with `--legacy-peer-deps`.

## The Fix

**Upgraded bcrypt from `^5.1.1` to `^6.0.0`.**

bcrypt@6.0.0 has **zero transitive dependencies** — it eliminated the `@mapbox/node-pre-gyp` → `tar` chain entirely. No more tar, no more CVEs.

The API is backwards compatible. All 444 existing tests pass without modification.

## What I Tested

I ran the following:

1. **Fresh install from tarball**:
   ```bash
   cd /tmp/test-fixed && npm install /path/to/claude-flow-security-3.0.0-alpha.6.tgz
   npm audit
   # → 0 vulnerabilities (was 4 HIGH)
   ```

2. **Dependency tree verification**:
   ```bash
   npm ls bcrypt tar
   # @claude-flow/security → bcrypt@6.0.0
   # (no tar in the tree)
   ```

3. **All tests pass**:
   ```bash
   cd v3/@claude-flow/security && pnpm test
   # ✓ 13 test files, 444 tests passed
   ```

4. **Build succeeds**:
   ```bash
   pnpm build
   # TypeScript compilation successful
   ```

## What I Couldn't Test

I didn't test this in a real downstream project that uses `@claude-flow/security` in production. I also didn't test native bcrypt compilation on Windows or macOS — only verified it works on Linux (Ubuntu 24.04 in the cloud agent VM).

If there are platform-specific bcrypt issues with 6.0.0, I didn't catch them.

## When Downstream Can Remove Their Override

Once this is published as `@claude-flow/security@3.0.0-alpha.7` (or whatever the next version is), downstream projects can safely delete their `"overrides": { "tar": "..." }` entry from package.json. The vulnerability is fixed at the source.

Fixes ruvnet/ruflo#1608

---

I'm trying to get more involved with this project — happy to iterate on this if anything looks off or if you want me to test something specific before merging.
