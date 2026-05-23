# Removed Agents (Issue #1504)

This document lists agents removed to reduce context bloat. All removed agents either:
1. Referenced non-existent MCP servers, making them non-functional
2. Were exact duplicates of other agents

## Non-Functional Agents Removed (15 files, ~95KB)

### Flow Nexus Agents (9 files, 34KB)
These agents required the `flow-nexus` MCP server, which is not included in standard Ruflo installations.

- `flow-nexus/app-store.md` - Required `mcp__flow-nexus__app_*` tools
- `flow-nexus/authentication.md` - Required `mcp__flow-nexus__auth_*` tools
- `flow-nexus/challenges.md` - Required `mcp__flow-nexus__challenge_*` tools
- `flow-nexus/neural-network.md` - Required `mcp__flow-nexus__neural_*` tools
- `flow-nexus/payments.md` - Required `mcp__flow-nexus__payment_*` tools
- `flow-nexus/sandbox.md` - Required `mcp__flow-nexus__sandbox_*` tools
- `flow-nexus/swarm.md` - Required `mcp__flow-nexus__swarm_*` tools
- `flow-nexus/user-tools.md` - Required `mcp__flow-nexus__user_*` tools
- `flow-nexus/workflow.md` - Required `mcp__flow-nexus__workflow_*` tools

### Sublinear Agents (5 files, 55KB)
These agents required the `sublinear-time-solver` MCP server, which doesn't exist in any standard installation.

- `sublinear/consensus-coordinator.md` - Required `mcp__sublinear-time-solver__solve` tools
- `sublinear/matrix-optimizer.md` - Required `mcp__sublinear-time-solver__optimize` tools
- `sublinear/pagerank-analyzer.md` - Required `mcp__sublinear-time-solver__pagerank` tools
- `sublinear/performance-optimizer.md` - Required `mcp__sublinear-time-solver__perf` tools
- `sublinear/trading-predictor.md` - Required `mcp__sublinear-time-solver__predict` tools

### Payments Agents (1 file, 5.5KB)
This agent required the `agentic-payments` MCP server, which is not included by default.

- `payments/agentic-payments.md` - Required `mcp__agentic-payments__*` tools

## Duplicate Agents Removed (10 files, ~47KB)

### Nested Category Duplicates (4 files)
Removed nested versions, kept the category root versions:

- `analysis/code-review/analyze-code-quality.md` → kept `analysis/analyze-code-quality.md`
- `development/backend/dev-backend-api.md` → kept `development/dev-backend-api.md`
- `testing/validation/production-validator.md` → kept `testing/production-validator.md`
- `testing/unit/tdd-london-swarm.md` → kept `testing/tdd-london-swarm.md`

### V3 Duplicates (4 files)
Removed v3 versions, kept root versions (these agents aren't v3-specific):

- `v3/database-specialist.md` → kept root `database-specialist.md`
- `v3/project-coordinator.md` → kept root `project-coordinator.md`
- `v3/python-specialist.md` → kept root `python-specialist.md`
- `v3/typescript-specialist.md` → kept root `typescript-specialist.md`

### Reasoning Category Duplicates (2 files)
Removed reasoning versions, kept goal versions (goal-planner is the canonical location):

- `reasoning/agent.md` → kept `goal/agent.md`
- `reasoning/goal-planner.md` → kept `goal/goal-planner.md`

## Impact

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Agent count** | 108 | 83 | -25 (-23%) |
| **Total size** | 827KB | 685KB | -142KB (-17%) |
| **Non-functional agents** | 15 | 0 | -15 (-100%) |
| **Duplicates** | 10 pairs | 0 | -10 pairs (-100%) |

## Restoring Removed Agents

If you need Flow Nexus, Sublinear, or Agentic Payments agents:

1. Install the required MCP server
2. Restore the agents from git history:
   ```bash
   git show HEAD~1:.claude/agents/flow-nexus/app-store.md > .claude/agents/flow-nexus/app-store.md
   ```

## Future Improvements (from Issue #1504)

This cleanup addressed immediate bloat but doesn't solve the root cause. Future improvements could include:

1. **Lazy loading** - Don't load agent definitions until first use
2. **Plugin system** - Optional agent packs installable via `ruflo agents install <pack>`
3. **Size limits** - Cap agent definitions at 2-3KB each
4. **Runtime prompts** - Move verbose instructions to runtime, not static definitions

See [Issue #1504](https://github.com/ruvnet/ruflo/issues/1504) for full discussion.
