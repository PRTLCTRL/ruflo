/**
 * Tests for ab-benchmark default executor warning (issue #1652)
 */

import { describe, it, expect } from 'vitest';
import { abBenchmark, type ABTask } from '../src/analyzer.js';

const SAMPLE_CLAUDE_MD = `# Test Project

## Rules
- Never commit secrets
- Always run tests before commit
- Use hierarchical topology for swarms
`;

const MINIMAL_TASK: ABTask = {
  id: 'test-task',
  description: 'Test task',
  taskClass: 'bug-fix',
  prompt: 'Fix a bug',
  assertions: [],
  gatePatterns: [],
};

describe('abBenchmark default executor warning', () => {
  it('throws error when using DefaultHeadlessExecutor without skipDefaultExecutorWarning', async () => {
    await expect(
      abBenchmark(SAMPLE_CLAUDE_MD, {
        // No executor provided, will use DefaultHeadlessExecutor
        // No skipDefaultExecutorWarning flag
        tasks: [MINIMAL_TASK],
      })
    ).rejects.toThrow(/ab-test with default executor may produce zero-delta results/);
  });

  it('includes estimated cost in error message', async () => {
    try {
      await abBenchmark(SAMPLE_CLAUDE_MD, {
        tasks: [MINIMAL_TASK, MINIMAL_TASK], // 2 tasks
      });
      // Should not reach here
      expect.fail('Expected abBenchmark to throw');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      expect(message).toContain('$');
      expect(message).toContain('API costs');
      expect(message).toContain('2.32'); // 2 tasks × 2 configs × $0.58 = $2.32
    }
  });

  it('includes issue link in error message', async () => {
    try {
      await abBenchmark(SAMPLE_CLAUDE_MD, { tasks: [MINIMAL_TASK] });
      expect.fail('Expected abBenchmark to throw');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      expect(message).toContain('https://github.com/ruvnet/ruflo/issues/1652');
    }
  });

  it('includes solution suggestions in error message', async () => {
    try {
      await abBenchmark(SAMPLE_CLAUDE_MD, { tasks: [MINIMAL_TASK] });
      expect.fail('Expected abBenchmark to throw');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      expect(message).toContain('Solutions:');
      expect(message).toContain('IContentAwareExecutor');
      expect(message).toContain('skipDefaultExecutorWarning: true');
      expect(message).toContain('mock executor');
    }
  });

  it('bypasses warning with skipDefaultExecutorWarning: true', async () => {
    // This test verifies the warning can be bypassed.
    // We use empty tasks to avoid actually running expensive claude -p commands.
    const result = await abBenchmark(SAMPLE_CLAUDE_MD, {
      skipDefaultExecutorWarning: true,
      tasks: [], // Empty tasks = no actual execution
    });

    // Should complete without throwing
    expect(result).toBeDefined();
    expect(result.configA).toBeDefined();
    expect(result.configB).toBeDefined();
  });

  it('calculates cost correctly for default 20-task suite', async () => {
    try {
      // Don't pass tasks = will use default 20 tasks
      await abBenchmark(SAMPLE_CLAUDE_MD, {});
      expect.fail('Expected abBenchmark to throw');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // 20 tasks × 2 configs × $0.58 = $23.20
      expect(message).toContain('23.20');
    }
  });

  it('allows custom content-aware executor without warning', async () => {
    // Create a mock content-aware executor
    class MockContentAwareExecutor {
      private context: string = '';

      setContext(content: string): void {
        this.context = content;
      }

      async execute(prompt: string, workDir: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
        return {
          stdout: JSON.stringify({
            result: `Mock result for: ${prompt.slice(0, 20)}...`,
            context: this.context.slice(0, 50),
          }),
          stderr: '',
          exitCode: 0,
        };
      }
    }

    // Should NOT throw because we're using a custom executor
    const result = await abBenchmark(SAMPLE_CLAUDE_MD, {
      executor: new MockContentAwareExecutor() as any,
      tasks: [MINIMAL_TASK],
    });

    expect(result).toBeDefined();
  });
});
