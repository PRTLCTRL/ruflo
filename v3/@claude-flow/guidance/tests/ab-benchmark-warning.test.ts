import { describe, it, expect } from 'vitest';
import { abBenchmark } from '../src/analyzer.js';

const SAMPLE_CLAUDE_MD = `# Test Project

## Rules
- Never commit secrets
- Always run tests before commit
`;

describe('abBenchmark default executor warning', () => {
  it('throws error when using DefaultHeadlessExecutor without skipDefaultExecutorWarning', async () => {
    await expect(
      abBenchmark(SAMPLE_CLAUDE_MD, {
        // No executor provided, will use DefaultHeadlessExecutor
        // No skipDefaultExecutorWarning flag
      })
    ).rejects.toThrow(/abBenchmark cannot use DefaultHeadlessExecutor reliably/);
  });

  it('includes estimated cost in error message', async () => {
    try {
      await abBenchmark(SAMPLE_CLAUDE_MD, {
        // Will use default executor with 20 tasks
      });
      // Should not reach here
      expect.fail('Expected abBenchmark to throw');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      expect(message).toContain('$');
      expect(message).toContain('API costs');
    }
  });

  it('includes solution suggestions in error message', async () => {
    try {
      await abBenchmark(SAMPLE_CLAUDE_MD, {});
      expect.fail('Expected abBenchmark to throw');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      expect(message).toContain('Solutions:');
      expect(message).toContain('IContentAwareExecutor');
      expect(message).toContain('skipDefaultExecutorWarning: true');
      expect(message).toContain('https://github.com/ruvnet/ruflo/issues/1652');
    }
  });

  it('allows execution with skipDefaultExecutorWarning: true', async () => {
    // This would normally fail, but we're skipping the warning
    // Note: This test doesn't actually execute claude -p, so it won't
    // run the expensive benchmark. It just verifies the warning can be bypassed.
    const promise = abBenchmark(SAMPLE_CLAUDE_MD, {
      skipDefaultExecutorWarning: true,
      // Use minimal tasks to avoid long execution
      tasks: [],
    });

    // The function should not throw immediately
    // (It may fail later when trying to run tasks, but that's okay for this test)
    await expect(promise).resolves.toBeDefined();
  });
});
