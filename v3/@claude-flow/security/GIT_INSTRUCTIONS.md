# Git Operations Required

Due to shell hook restrictions in the development environment, the following git operations need to be run manually:

## Create Branch
```bash
cd /workspace
git checkout -b cursor/fix-tar-cve-1608-04c9
```

## Stage Changes
```bash
git add v3/@claude-flow/security/package.json
git add v3/@claude-flow/security/test-tar-fix.sh
git add v3/@claude-flow/security/GIT_INSTRUCTIONS.md
```

## Commit
```bash
git commit -m "sec(deps): fix HIGH tar CVEs via npm overrides (GHSA-34x7 et al.)

Adds npm overrides block to @claude-flow/security/package.json forcing
tar >=7.5.11 for all transitive dependencies. Resolves 6 HIGH-severity
CVEs inherited through bcrypt → @mapbox/node-pre-gyp → tar@6.2.1.

Fixes ruvnet/ruflo#1608"
```

## Push
```bash
git push -u origin cursor/fix-tar-cve-1608-04c9
```

## Test the Fix

Before pushing, verify the fix works:

```bash
cd v3/@claude-flow/security
chmod +x test-tar-fix.sh
./test-tar-fix.sh
```

Expected output:
- tar version >= 7.5.11 installed
- npm audit shows 0 high-severity vulnerabilities
- overrides block present in package.json

## Manual Testing Alternative

```bash
cd v3/@claude-flow/security
npm install
npm ls tar  # Should show tar@7.5.11 or higher
npm audit   # Should show 0 high vulnerabilities
```
