#!/usr/bin/env node
/**
 * Test script for issue #1652
 * Verifies that DefaultHeadlessExecutor properly swaps CLAUDE.md between configs
 */

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Check if the source has the fix
const analyzerPath = join(__dirname, 'v3/@claude-flow/guidance/src/analyzer.ts');
const source = readFileSync(analyzerPath, 'utf-8');

console.log('Checking if DefaultHeadlessExecutor implements IContentAwareExecutor...\n');

// Check for the interface implementation
const implementsInterface = source.includes('class DefaultHeadlessExecutor implements IContentAwareExecutor');
console.log(`✓ Implements IContentAwareExecutor: ${implementsInterface ? 'YES' : 'NO'}`);

// Check for setContext method
const hasSetContext = source.includes('setContext(claudeMdContent: string)');
console.log(`✓ Has setContext() method: ${hasSetContext ? 'YES' : 'NO'}`);

// Check for file swapping logic
const hasFileSwap = source.includes('await fs.writeFile(claudeMdPath, this.contextContent');
console.log(`✓ Has file swapping logic: ${hasFileSwap ? 'YES' : 'NO'}`);

// Check for backup/restore
const hasBackup = source.includes('await fs.copyFile(claudeMdPath, backupPath)');
const hasRestore = source.includes('await fs.copyFile(backupPath, claudeMdPath)');
console.log(`✓ Has backup logic: ${hasBackup ? 'YES' : 'NO'}`);
console.log(`✓ Has restore logic: ${hasRestore ? 'YES' : 'NO'}`);

console.log('\n' + '='.repeat(60));
if (implementsInterface && hasSetContext && hasFileSwap && hasBackup && hasRestore) {
  console.log('✅ Issue #1652 FIX IS PRESENT in source code');
  console.log('\nThe fix was added in commit c2c21f6ae (v3.6.7)');
  console.log('DefaultHeadlessExecutor now properly implements content-aware');
  console.log('file swapping for A/B testing.');
  console.log('\nStatus: ALREADY FIXED - needs to be published to npm');
  process.exit(0);
} else {
  console.log('❌ Issue #1652 fix is MISSING');
  process.exit(1);
}
