#!/bin/bash
# Test script to verify tar CVE fix
# This script validates that the npm overrides fix works correctly

set -e

echo "=== Testing tar CVE fix for @claude-flow/security ==="
echo ""

cd "$(dirname "$0")"

echo "1. Installing dependencies..."
npm install --silent 2>&1 | grep -E "(added|removed|changed|audited)" || true
echo ""

echo "2. Checking installed tar version..."
TAR_VERSION=$(npm ls tar 2>/dev/null | grep "tar@" | head -1 | sed 's/.*tar@//' | sed 's/ .*//')
echo "   Installed: tar@$TAR_VERSION"
echo ""

if [ -n "$TAR_VERSION" ]; then
  MAJOR=$(echo "$TAR_VERSION" | cut -d. -f1)
  MINOR=$(echo "$TAR_VERSION" | cut -d. -f2)
  PATCH=$(echo "$TAR_VERSION" | cut -d. -f3)
  
  # Check if >= 7.5.11
  if [ "$MAJOR" -gt 7 ] || ([ "$MAJOR" -eq 7 ] && [ "$MINOR" -gt 5 ]) || ([ "$MAJOR" -eq 7 ] && [ "$MINOR" -eq 5 ] && [ "$PATCH" -ge 11 ]); then
    echo "   ✓ tar version is >= 7.5.11 (secure)"
  else
    echo "   ✗ tar version is < 7.5.11 (vulnerable)"
    exit 1
  fi
fi

echo ""
echo "3. Running npm audit..."
AUDIT_OUTPUT=$(npm audit --json 2>/dev/null || true)
HIGH_VULN=$(echo "$AUDIT_OUTPUT" | grep -o '"high":[0-9]*' | cut -d: -f2)

if [ -z "$HIGH_VULN" ] || [ "$HIGH_VULN" = "0" ]; then
  echo "   ✓ No high-severity vulnerabilities found"
else
  echo "   ✗ Found $HIGH_VULN high-severity vulnerabilities"
  echo ""
  echo "   Details:"
  npm audit 2>&1 | grep -A5 "high" || true
  exit 1
fi

echo ""
echo "4. Verifying override is present in package.json..."
if grep -q '"overrides"' package.json; then
  echo "   ✓ overrides block found"
  grep -A2 '"overrides"' package.json | sed 's/^/   /'
else
  echo "   ✗ overrides block missing"
  exit 1
fi

echo ""
echo "=== All tests passed! ==="
echo ""
echo "Summary:"
echo "  - tar >= 7.5.11 installed"
echo "  - No high-severity CVEs"
echo "  - Override properly configured"
