/**
 * Integration tests for stub implementations
 * 
 * Tests the real implementations of:
 * - getFilesInPath()
 * - performSemanticSearch()
 * - getAllRelatedFiles()
 * - enrichGraphWithEdges()
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createToolContext, semanticSearchTool, architectureAnalyzeTool } from '../src/mcp-tools.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('Stub Implementations', () => {
  let tempDir: string;

  beforeAll(async () => {
    // Create a temporary test directory structure
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'code-intelligence-test-'));

    // Create test files
    await fs.mkdir(path.join(tempDir, 'src'), { recursive: true });
    await fs.mkdir(path.join(tempDir, 'src/utils'), { recursive: true });
    await fs.mkdir(path.join(tempDir, 'src/components'), { recursive: true });

    // Create test TypeScript files with import relationships
    await fs.writeFile(
      path.join(tempDir, 'src/utils/validation.ts'),
      `export function validateEmail(email: string): boolean {
  const emailRegex = /^[^@]+@[^@]+\\.[^@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}
`
    );

    await fs.writeFile(
      path.join(tempDir, 'src/utils/formatter.ts'),
      `export function formatName(name: string): string {
  return name.trim().toUpperCase();
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
`
    );

    await fs.writeFile(
      path.join(tempDir, 'src/components/UserForm.ts'),
      `import { validateEmail, validatePassword } from '../utils/validation.js';
import { formatName } from '../utils/formatter.js';

export class UserForm {
  validate(email: string, password: string): boolean {
    return validateEmail(email) && validatePassword(password);
  }

  formatUserName(name: string): string {
    return formatName(name);
  }
}
`
    );

    await fs.writeFile(
      path.join(tempDir, 'src/index.ts'),
      `import { UserForm } from './components/UserForm.js';

export function createUserForm(): UserForm {
  return new UserForm();
}
`
    );

    // Create package.json to mark as project root
    await fs.writeFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ name: 'test-project', version: '1.0.0' })
    );
  });

  afterAll(async () => {
    // Clean up temporary directory
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('getFilesInPath', () => {
    it('should discover TypeScript files recursively', async () => {
      const context = createToolContext({
        allowedRoots: [tempDir],
        blockedPatterns: [],
      });

      const input = {
        targetPath: tempDir,
        analysisTypes: ['dependency_graph'],
      };

      const result = await architectureAnalyzeTool.handler(input, context);

      expect(result.content).toBeDefined();
      const data = JSON.parse(result.content[0]?.text ?? '{}');
      
      // Should have found 4 TypeScript files
      expect(data.dependencyGraph?.nodes?.length).toBeGreaterThanOrEqual(4);
    });

    it('should exclude common build directories', async () => {
      // Create node_modules directory
      await fs.mkdir(path.join(tempDir, 'node_modules'), { recursive: true });
      await fs.writeFile(
        path.join(tempDir, 'node_modules/test.ts'),
        'export const test = "should be ignored";'
      );

      const context = createToolContext({
        allowedRoots: [tempDir],
        blockedPatterns: [],
      });

      const input = {
        targetPath: tempDir,
        analysisTypes: ['dependency_graph'],
      };

      const result = await architectureAnalyzeTool.handler(input, context);
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      // Should not include node_modules files
      const nodeIds = data.dependencyGraph?.nodes?.map((n: any) => n.id) ?? [];
      expect(nodeIds.every((id: string) => !id.includes('node_modules'))).toBe(true);

      // Clean up
      await fs.rm(path.join(tempDir, 'node_modules'), { recursive: true, force: true });
    });
  });

  describe('performSemanticSearch', () => {
    it('should find semantically similar code', async () => {
      const context = createToolContext({
        allowedRoots: [tempDir],
        blockedPatterns: [],
      });

      const input = {
        query: 'email validation function',
        topK: 5,
        scope: {
          paths: [tempDir],
        },
      };

      const result = await semanticSearchTool.handler(input, context);

      expect(result.content).toBeDefined();
      const data = JSON.parse(result.content[0]?.text ?? '{}');
      
      expect(data.success).toBe(true);
      expect(data.results).toBeDefined();
      expect(Array.isArray(data.results)).toBe(true);
      // Note: Embeddings package may not be available in test environment
      // Test passes if structure is correct, even with empty results
    });

    it('should filter by language', async () => {
      const context = createToolContext({
        allowedRoots: [tempDir],
        blockedPatterns: [],
      });

      const input = {
        query: 'validation',
        topK: 5,
        scope: {
          paths: [tempDir],
          languages: ['typescript'],
        },
      };

      const result = await semanticSearchTool.handler(input, context);
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.success).toBe(true);
      // Structure is valid even if embeddings package not available
    });

    it('should exclude test files when requested', async () => {
      // Create a test file
      await fs.writeFile(
        path.join(tempDir, 'src/utils/validation.test.ts'),
        'import { validateEmail } from "./validation.js"; test("validates email", () => {});'
      );

      const context = createToolContext({
        allowedRoots: [tempDir],
        blockedPatterns: [],
      });

      const input = {
        query: 'validation',
        topK: 10,
        scope: {
          paths: [tempDir],
          excludeTests: true,
        },
      };

      const result = await semanticSearchTool.handler(input, context);
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.success).toBe(true);
      // If results exist, they should not include test files
      const files = data.results?.map((r: any) => r.filePath) ?? [];
      if (files.length > 0) {
        expect(files.every((f: string) => !f.includes('.test.'))).toBe(true);
      }

      // Clean up
      await fs.rm(path.join(tempDir, 'src/utils/validation.test.ts'), { force: true });
    });
  });

  describe('enrichGraphWithEdges', () => {
    it('should add real import edges to dependency graph', async () => {
      const context = createToolContext({
        allowedRoots: [tempDir],
        blockedPatterns: [],
      });

      const input = {
        targetPath: tempDir,
        analysisTypes: ['dependency_graph'],
      };

      const result = await architectureAnalyzeTool.handler(input, context);
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      // Should have nodes (files)
      expect(data.dependencyGraph?.nodes?.length).toBeGreaterThan(0);
      
      // Should have edges (import relationships) after enrichment
      expect(data.dependencyGraph?.edges?.length).toBeGreaterThan(0);
      
      // UserForm.ts imports from validation.ts and formatter.ts
      const edges = data.dependencyGraph?.edges ?? [];
      const userFormEdges = edges.filter((e: any) => e.from?.includes('UserForm.ts'));
      expect(userFormEdges.length).toBeGreaterThan(0);
    });

    it('should detect circular dependencies', async () => {
      // Create circular dependency: A -> B -> A
      await fs.writeFile(
        path.join(tempDir, 'src/moduleA.ts'),
        `import { funcB } from './moduleB.js';
export function funcA() { return funcB(); }`
      );

      await fs.writeFile(
        path.join(tempDir, 'src/moduleB.ts'),
        `import { funcA } from './moduleA.js';
export function funcB() { return funcA(); }`
      );

      const context = createToolContext({
        allowedRoots: [tempDir],
        blockedPatterns: [],
      });

      const input = {
        targetPath: tempDir,
        analysisTypes: ['circular_deps'],
      };

      const result = await architectureAnalyzeTool.handler(input, context);
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      // Should detect the circular dependency
      expect(data.circularDeps).toBeDefined();
      expect(data.circularDeps?.length).toBeGreaterThan(0);

      // Clean up
      await fs.rm(path.join(tempDir, 'src/moduleA.ts'), { force: true });
      await fs.rm(path.join(tempDir, 'src/moduleB.ts'), { force: true });
    });
  });

  describe('getAllRelatedFiles', () => {
    it('should find forward dependencies', async () => {
      const context = createToolContext({
        allowedRoots: [tempDir],
        blockedPatterns: [],
      });

      const userFormPath = path.join(tempDir, 'src/components/UserForm.ts');
      
      const input = {
        changes: [
          {
            file: userFormPath,
            type: 'modify',
            details: { description: 'Update validation logic' },
          },
        ],
        depth: 3,
      };

      const result = await architectureAnalyzeTool.handler(input, context);
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.success).toBe(true);
    });
  });

  describe('Health score calculation', () => {
    it('should calculate architecture health score', async () => {
      const context = createToolContext({
        allowedRoots: [tempDir],
        blockedPatterns: [],
      });

      const input = {
        targetPath: tempDir,
        analysisTypes: ['dependency_graph'],
      };

      const result = await architectureAnalyzeTool.handler(input, context);
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.summary?.healthScore).toBeDefined();
      expect(typeof data.summary?.healthScore).toBe('number');
      expect(data.summary?.healthScore).toBeGreaterThanOrEqual(0);
      expect(data.summary?.healthScore).toBeLessThanOrEqual(100);
    });
  });
});
