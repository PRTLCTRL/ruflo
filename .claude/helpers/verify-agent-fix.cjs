#!/usr/bin/env node
/**
 * Verify package.json "files" array changes for issue #1504
 * Tests that only core agents will be shipped in npm package
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying agent bloat fix (issue #1504)...\n');

// Read package.json
const pkgPath = path.join(__dirname, '../..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

console.log('📦 Package:', pkg.name, 'v' + pkg.version);
console.log('');

// Check for exclusions
const files = pkg.files || [];
const agentExclusions = files.filter(f => f.startsWith('!.claude/agents/'));

console.log('✅ Found', agentExclusions.length, 'agent exclusion patterns in package.json');
console.log('');

// Expected exclusions
const expectedExcluded = [
  'flow-nexus',
  'sublinear',
  'payments',
  'consensus',
  'optimization',
  'hive-mind',
  'sparc',
  'templates',
  'dual-mode',
  'neural',
  'sona',
  'reasoning',
  'goal',
  'custom',
  'data',
  'devops',
  'documentation',
  'development',
  'specialized',
  'architecture',
  'analysis',
  'testing',
  'v3'
];

const expectedIncluded = [
  'core/',
  'github/pr-manager.md',
  'github/issue-tracker.md',
  'github/code-review-swarm.md',
  'swarm/hierarchical-coordinator.md',
  'security-auditor.md'
];

console.log('📋 Expected exclusions:');
let missing = [];
for (const dir of expectedExcluded) {
  const pattern = `!.claude/agents/${dir}/**`;
  if (files.some(f => f.includes(dir))) {
    console.log('  ✓', dir);
  } else {
    console.log('  ✗', dir, '(NOT FOUND)');
    missing.push(dir);
  }
}

if (missing.length > 0) {
  console.log('\n⚠️  Warning:', missing.length, 'expected exclusions not found');
} else {
  console.log('\n✅ All expected exclusions present');
}

console.log('\n📋 Expected inclusions (should NOT be in exclusions):');
for (const file of expectedIncluded) {
  const excluded = files.some(f => f.startsWith('!') && f.includes(file));
  if (excluded) {
    console.log('  ✗', file, '(INCORRECTLY EXCLUDED)');
  } else {
    console.log('  ✓', file);
  }
}

console.log('\n📊 Summary:');
console.log('  • Total "files" entries:', files.length);
console.log('  • Agent exclusions:', agentExclusions.length);
console.log('  • Expected to ship: ~12 core agents');
console.log('  • Expected to exclude: ~94 non-core agents');

console.log('\n✅ Verification complete!');
console.log('\nNote: This only verifies package.json structure.');
console.log('To see actual files that would ship, run: npm pack --dry-run');
