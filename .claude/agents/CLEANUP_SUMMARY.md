# Agent Cleanup Summary

**Date**: 2026-06-04  
**Issue**: [#1504](https://github.com/ruvnet/ruflo/issues/1504)  
**Change**: Removed 21 non-functional and duplicate agent definitions

## What Was Removed

### Non-Functional Agents (17 files, ~270KB)

These agents reference MCP servers that don't ship with standard Ruflo installations:

#### Flow Nexus Agents (9 files)
- `flow-nexus/app-store.md`
- `flow-nexus/authentication.md`
- `flow-nexus/challenges.md`
- `flow-nexus/neural-network.md`
- `flow-nexus/payments.md`
- `flow-nexus/sandbox.md`
- `flow-nexus/swarm.md`
- `flow-nexus/user-tools.md`
- `flow-nexus/workflow.md`

**Why removed**: All call `mcp__flow-nexus__*` tools. Flow Nexus is a separate SaaS platform that requires external configuration and is not included in standard Ruflo installs.

#### Sublinear Time Solver Agents (5 files)
- `sublinear/consensus-coordinator.md`
- `sublinear/matrix-optimizer.md`
- `sublinear/pagerank-analyzer.md`
- `sublinear/performance-optimizer.md`
- `sublinear/trading-predictor.md`

**Why removed**: All call `mcp__sublinear-time-solver__*` tools. This MCP server doesn't exist in any standard installation. These agents were marketing copy claiming features like "quantum advantage" and "temporal arbitrage" that aren't implementable.

#### Payment Agents (1 file)
- `payments/agentic-payments.md`

**Why removed**: Calls `mcp__agentic-payments__*` tools. This MCP server is not installed by default.

#### Other Flow Nexus Dependencies (2 files)
- `goal/agent.md`
- `reasoning/agent.md`

**Why removed**: Both referenced `mcp__flow-nexus__*` tools and were duplicates of each other.

### Duplicate Agent Files (4 files)

These were identical copies of existing agents:

- `analysis/code-review/analyze-code-quality.md` → kept `analysis/analyze-code-quality.md`
- `testing/validation/production-validator.md` → kept `testing/production-validator.md`
- `testing/unit/tdd-london-swarm.md` → kept `testing/tdd-london-swarm.md`
- `v3/project-coordinator.md` → kept root `project-coordinator.md`

**Why removed**: Exact duplicates (same MD5 hashes) that bloated the context window.

## Impact

### Before
- **106 agent files**
- **1.2MB** total size
- **~300K tokens** of context

### After
- **87 agent files** (19.6% reduction)
- **996KB** total size (17% reduction)
- **~250K tokens** of context (17% reduction)

### Token Cost Savings

At $0.015/1K input tokens on Claude Opus 4:
- **Before**: ~$4.50 per conversation in agent definitions
- **After**: ~$3.75 per conversation
- **Savings**: ~$0.75 per conversation, or ~$15/day for 20 conversations

## What Remains

All functional agents are still available:

### Core Development (5 agents)
- `core/coder.md` - Code implementation
- `core/planner.md` - Task planning
- `core/researcher.md` - Research and analysis
- `core/reviewer.md` - Code review
- `core/tester.md` - Test generation

### GitHub Integration (13 agents)
- `github/pr-manager.md`
- `github/issue-tracker.md`
- `github/code-review-swarm.md`
- ... and 10 more

### Swarm Coordination (3 agents)
- `swarm/hierarchical-coordinator.md`
- `swarm/mesh-coordinator.md`
- `swarm/adaptive-coordinator.md`

### V3 Specialists (9 agents)
- `v3/security-architect.md`
- `v3/memory-specialist.md`
- `v3/performance-engineer.md`
- ... and 6 more

### All Other Functional Agents
- Consensus (7 agents)
- Testing (3 agents)
- Templates (9 agents)
- Architecture (1 agent)
- And more...

## Future Improvements

This cleanup addresses the immediate bloat issue, but there's more that could be done:

1. **Lazy loading**: Only load agent definitions when first used
2. **Plugin system**: Move specialized agents to opt-in plugins
3. **Size optimization**: Many agents could be trimmed from 15-35KB to <2KB
4. **Better categorization**: Clearer separation of built-in vs extension agents

## Migration

If you relied on any of the removed agents:

### Flow Nexus Agents
Install Flow Nexus separately and configure the MCP server:
```bash
# In .claude/mcp.json
{
  "mcpServers": {
    "flow-nexus": {
      "command": "npx",
      "args": ["flow-nexus-mcp"]
    }
  }
}
```

### Sublinear Agents
These agents were non-functional. For similar capabilities:
- `sublinear/performance-optimizer` → use `core/coder` with performance focus
- `sublinear/consensus-coordinator` → use `consensus/raft-manager` or `consensus/byzantine-coordinator`
- Others were marketing copy with no real implementation

### Payment Agents
Install the agentic-payments MCP server separately if needed.

## Questions?

See the full discussion in [Issue #1504](https://github.com/ruvnet/ruflo/issues/1504).
