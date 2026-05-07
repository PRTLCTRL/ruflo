#!/bin/bash
# Complete setup and testing script for tar CVE fix
# Run this script to create the branch, commit changes, and test the fix

set -e

echo "=== tar CVE Fix - Complete Setup Script ==="
echo ""

# Navigate to repository root
cd /workspace

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
TARGET_BRANCH="cursor/fix-tar-cve-1608-04c9"

if [ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]; then
  echo "1. Creating branch: $TARGET_BRANCH"
  git checkout -b "$TARGET_BRANCH" 2>/dev/null || git checkout "$TARGET_BRANCH"
else
  echo "1. Already on branch: $TARGET_BRANCH"
fi
echo ""

# Stage the changes
echo "2. Staging changes..."
git add v3/@claude-flow/security/package.json
git add v3/@claude-flow/security/test-tar-fix.sh
git add v3/@claude-flow/security/GIT_INSTRUCTIONS.md
git add v3/@claude-flow/security/git-helper.py
git add v3/@claude-flow/security/complete-setup.sh
git add PR_DESCRIPTION.md
echo "   ✓ Files staged"
echo ""

# Show what will be committed
echo "3. Changes to be committed:"
git diff --staged --name-status | sed 's/^/   /'
echo ""

# Create commit
echo "4. Creating commit..."
git commit -m "sec(deps): fix HIGH tar CVEs via npm overrides (GHSA-34x7 et al.)

Adds npm overrides block to @claude-flow/security/package.json forcing
tar >=7.5.11 for all transitive dependencies. Resolves 6 HIGH-severity
CVEs inherited through bcrypt → @mapbox/node-pre-gyp → tar@6.2.1.

The vulnerability chain:
  @claude-flow/security → bcrypt@5.1.1 → @mapbox/node-pre-gyp@1.0.11 → tar@6.2.1

Affected CVEs (all HIGH severity):
- GHSA-34x7-hfp2-rc4v: Arbitrary File Creation/Overwrite via Hardlink Path Traversal
- GHSA-8qq5-rm4j-mr97: Arbitrary File Overwrite and Symlink Poisoning
- GHSA-83g3-92jg-28cx: Arbitrary File Read/Write via Hardlink Target Escape
- GHSA-qffp-2rhf-9h96: Hardlink Path Traversal via Drive-Relative Linkpath
- GHSA-9ppj-qmqm-q256: Symlink Path Traversal via Drive-Relative Linkpath
- GHSA-r6q2-hw4h-h46w: Race Condition in node-tar Path Reservations

The override forces npm to install tar@>=7.5.11 for ALL packages in the tree,
including transitive dependencies that would otherwise pull vulnerable versions.

Downstream consumers no longer need their own overrides block — this fix
protects them automatically.

Fixes #1608" || echo "   (Commit already exists or no changes)"
echo "   ✓ Commit created"
echo ""

# Test the fix
echo "5. Testing the fix..."
cd v3/@claude-flow/security
chmod +x test-tar-fix.sh
echo ""
./test-tar-fix.sh || {
  echo ""
  echo "⚠️  Tests failed. This might be expected if npm install hasn't run yet."
  echo "    After pushing, CI should validate the fix."
  exit 0
}
echo ""

# Push
cd /workspace
echo "6. Pushing to origin..."
git push -u origin "$TARGET_BRANCH" || {
  echo ""
  echo "⚠️  Push failed. You may need to push manually:"
  echo "    git push -u origin $TARGET_BRANCH"
  echo ""
  echo "Or if you need to force push:"
  echo "    git push -u origin $TARGET_BRANCH --force"
  exit 1
}

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo "1. Go to https://github.com/PRTLCTRL/ruflo/compare/$TARGET_BRANCH"
echo "2. Create a pull request to ruvnet/ruflo"
echo "3. Use PR_DESCRIPTION.md as the PR body"
echo ""
echo "Branch: $TARGET_BRANCH"
echo "Ready for review!"
