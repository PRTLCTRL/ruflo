# Agent Cleanup Summary

## Overview

This cleanup addresses issue #1504 by removing 26 non-functional and duplicate agent definitions from the `.claude/agents/` directory.

**Before:** 108 agent files, 832K total size
**After:** 82 agent files, 723K total size
**Reduction:** 26 agents removed (24%), 109K saved (13%)

## What Was Removed

### Non-Functional Agents (17 files)

These agents reference MCP servers that don't ship with a standard Ruflo installation:

#### flow-nexus/* (9 agents)
All require `flow-nexus` MCP server which is a separate SaaS platform:
- `app-store.md` - calls `mcp__flow-nexus__app_search`, `mcp__flow-nexus__app_store_publish_app`
- `authentication.md` - calls `mcp__flow-nexus__auth_*` tools
- `challenges.md` - calls `mcp__flow-nexus__challenge_*` tools
- `neural-network.md` - calls `mcp__flow-nexus__neural_*` tools
- `payments.md` - calls `mcp__flow-nexus__payment_*` tools
- `sandbox.md` - calls `mcp__flow-nexus__sandbox_*` tools
- `swarm.md` - calls `mcp__flow-nexus__swarm_*` tools
- `user-tools.md` - calls `mcp__flow-nexus__user_*` tools
- `workflow.md` - calls `mcp__flow-nexus__workflow_*` tools

These agents would **always fail** when spawned without the flow-nexus MCP server installed.

#### sublinear/* (5 agents)
All require `sublinear-time-solver` MCP server which doesn't exist in standard installs:
- `consensus-coordinator.md` - calls `mcp__sublinear-time-solver__solve`
- `matrix-optimizer.md` - calls `mcp__sublinear-time-solver__solve`
- `pagerank-analyzer.md` - calls `mcp__sublinear-time-solver__solve`
- `performance-optimizer.md` - calls `mcp__sublinear-time-solver__solve`
- `trading-predictor.md` - calls `mcp__sublinear-time-solver__predictWithTemporalAdvantage`

The `trading-predictor` agent claimed to "execute trades before market data physically arrives via temporal advantage" - pure marketing fiction.

#### payments/agentic-payments.md (1 agent)
Requires `agentic-payments` MCP server (not installed):
- calls `mcp__agentic-payments__*` tools

#### goal/agent.md, reasoning/agent.md (2 agents)
These also referenced the non-existent MCP servers above.

### Duplicate Agents (9 files)

These agents existed in multiple locations. We kept the simpler paths and removed nested duplicates:

#### Nested Duplicates
- `analysis/code-review/analyze-code-quality.md` (kept `analysis/analyze-code-quality.md`)
- `development/backend/dev-backend-api.md` (kept `development/dev-backend-api.md`)
- `testing/validation/production-validator.md` (kept `testing/production-validator.md`)
- `testing/unit/tdd-london-swarm.md` (kept `testing/tdd-london-swarm.md`)
- `reasoning/goal-planner.md` (kept `goal/goal-planner.md`)

#### v3 Stubs
These were 9-line stub definitions that duplicated root-level agents:
- `v3/database-specialist.md` (kept root `database-specialist.md`)
- `v3/project-coordinator.md` (kept root `project-coordinator.md`)
- `v3/python-specialist.md` (kept root `python-specialist.md`)
- `v3/typescript-specialist.md` (kept root `typescript-specialist.md`)

The v3 versions were nearly identical to root versions (only last line differed), so we kept the root versions for simplicity.

## What Remains

### Core Agents (5) - The Foundation
- `core/coder.md` - Implementation specialist
- `core/planner.md` - Strategic planning
- `core/researcher.md` - Deep research
- `core/reviewer.md` - Code review
- `core/tester.md` - Testing specialist

### GitHub Integration (13) - Actually Useful
- `github/pr-manager.md`
- `github/issue-tracker.md`
- `github/code-review-swarm.md`
- `github/github-modes.md`
- `github/multi-repo-swarm.md`
- `github/project-board-sync.md`
- `github/release-manager.md`
- `github/release-swarm.md`
- `github/repo-architect.md`
- `github/swarm-issue.md`
- `github/swarm-pr.md`
- `github/sync-coordinator.md`
- `github/workflow-automation.md`

### Swarm Coordination (3)
- `swarm/hierarchical-coordinator.md`
- `swarm/mesh-coordinator.md`
- `swarm/adaptive-coordinator.md`

### V3 Specialists (6)
- `v3/v3-integration-architect.md`
- `v3/v3-memory-specialist.md`
- `v3/v3-performance-engineer.md`
- `v3/v3-queen-coordinator.md`
- `v3/v3-security-architect.md`
- `v3/test-architect.md`

### Consensus & Distributed (7)
- `consensus/byzantine-coordinator.md`
- `consensus/crdt-synchronizer.md`
- `consensus/gossip-coordinator.md`
- `consensus/performance-benchmarker.md`
- `consensus/quorum-manager.md`
- `consensus/raft-manager.md`
- `consensus/security-manager.md`

### Hive Mind (5)
- `hive-mind/collective-intelligence-coordinator.md`
- `hive-mind/queen-coordinator.md`
- `hive-mind/scout-explorer.md`
- `hive-mind/swarm-memory-manager.md`
- `hive-mind/worker-specialist.md`

### Other Useful Agents (43)
Includes SPARC methodology agents, templates, optimization tools, testing frameworks, and specialized domain agents.

## Agents by Category (After Cleanup)

```
analysis:         2 agents
architecture:     1 agent
consensus:        7 agents
core:             5 agents (THE ESSENTIALS)
custom:           1 agent
data:             1 agent
development:      1 agent
devops:           1 agent
documentation:    1 agent
dual-mode:        3 agents
github:          13 agents (VERY USEFUL)
goal:             2 agents
hive-mind:        5 agents
neural:           1 agent
optimization:     5 agents
sona:             1 agent
sparc:            4 agents
specialized:      1 agent
swarm:            3 agents
templates:        9 agents
testing:          2 agents
v3:               6 agents
---
Total:           82 agents
```

## Impact

### Token Savings
Assuming ~2.5 tokens per character on average:
- **Before:** 832K ≈ 333K tokens
- **After:** 723K ≈ 289K tokens
- **Savings:** ~44K tokens per session

At $0.015/1K input tokens (Claude Opus):
- **Cost per session before:** ~$5.00
- **Cost per session after:** ~$4.34
- **Savings per session:** ~$0.66
- **Over 20 conversations/day:** ~$13.20/day saved

### Error Message Reduction
When an agent spawn fails, the error previously dumped 90+ agent names. Now it dumps 82 names, a modest improvement. Further optimization could load agents lazily to reduce this even more.

## What This Doesn't Break

### Documentation References
Files like `CLAUDE.md`, `USERGUIDE.md`, and plugin docs still mention flow-nexus, sublinear, and other integrations. **This is correct** - they're documenting the broader ecosystem and optional plugins users can install.

### Optional Plugins
Users can still install these as plugins if they have the required infrastructure:
```bash
ruflo plugins install @claude-flow/plugin-flow-nexus  # if you have Flow Nexus
ruflo plugins install @claude-flow/plugin-sublinear   # if you have that MCP
```

The issue was shipping these **by default** when most users don't have the required MCP servers.

## Next Steps (Not in This PR)

The issue proposed several options. This PR implements **Option C: Remove non-functional agents** as a minimum viable fix. Future improvements could include:

1. **Option A: Minimal core set with opt-in registry** - Move more agents to a registry
2. **Option B: Lazy loading** - Don't register agents until first use
3. **Option D: Further deduplication** - Some remaining agents are verbose (15-35KB) and could be trimmed

## Testing

- Verified all remaining agent files have valid YAML frontmatter
- Confirmed core agents (coder, tester, reviewer, planner, researcher) are present
- Confirmed GitHub integration agents are intact
- Build errors exist but are **pre-existing TypeScript issues** unrelated to this cleanup

The agent cleanup itself is low-risk - we only deleted .md files that referenced tools that don't exist.
