# Agent Cleanup - Issue #1504

## Summary

Removed 22 agent definition files (15 non-functional + 7 duplicates) totaling ~92KB from `.claude/agents/`.

These agents referenced MCP servers that don't ship with standard Ruflo installations, making them non-functional by default. Users who want these agents can opt in by installing the required MCP servers separately.

## Non-Functional Agents Removed (15 files)

### Flow Nexus Agents (9 files, ~32KB)
**Reason:** Require `flow-nexus` MCP server (not installed by default)

- `flow-nexus/app-store.md` - Application marketplace management
- `flow-nexus/authentication.md` - Flow Nexus auth operations
- `flow-nexus/challenges.md` - Challenge and achievement system
- `flow-nexus/neural-network.md` - Neural network training in E2B sandboxes
- `flow-nexus/payments.md` - RUV token payment system
- `flow-nexus/sandbox.md` - E2B sandbox management
- `flow-nexus/swarm.md` - Cloud swarm deployment
- `flow-nexus/user-tools.md` - User profile management
- `flow-nexus/workflow.md` - Workflow orchestration

### Sublinear Time Solver Agents (5 files, ~55KB)
**Reason:** Require `sublinear-time-solver` MCP server (doesn't exist)

- `sublinear/consensus-coordinator.md` - Distributed consensus with "temporal advantage"
- `sublinear/matrix-optimizer.md` - Matrix operations
- `sublinear/pagerank-analyzer.md` - PageRank calculations
- `sublinear/performance-optimizer.md` - Performance analysis
- `sublinear/trading-predictor.md` - Claims to "execute trades before market data arrives"

### Agentic Payments Agent (1 file, ~5KB)
**Reason:** Requires `agentic-payments` MCP server (not installed by default)

- `payments/agentic-payments.md` - Active mandate payment system

## Duplicate Files Removed (7 files)

Removed nested duplicates, kept root category versions:

- `analysis/code-review/analyze-code-quality.md` (kept `analysis/analyze-code-quality.md`)
- `architecture/system-design/arch-system-design.md` (directory now empty, removed)
- `data/ml/data-ml-model.md` (directory now empty, removed)
- `development/backend/dev-backend-api.md` (kept `development/dev-backend-api.md`)
- `devops/ci-cd/ops-cicd-github.md` (directory now empty, removed)
- `documentation/api-docs/docs-api-openapi.md` (directory now empty, removed)
- `specialized/mobile/spec-mobile-react-native.md` (directory now empty, removed)

## What Remains (86 agents)

**Core functional agents** (work out of the box):
- `core/coder.md` - Code implementation
- `core/planner.md` - Task planning
- `core/researcher.md` - Requirements research
- `core/reviewer.md` - Code review
- `core/tester.md` - Test writing

**GitHub agents** (work with GitHub integration):
- `github/pr-manager.md`
- `github/issue-tracker.md`
- `github/code-review-swarm.md`
- And 10 more...

**Swarm coordination** (work with standard ruflo MCP):
- `swarm/hierarchical-coordinator.md`
- `swarm/mesh-coordinator.md`
- `swarm/adaptive-coordinator.md`

**V3 specialized** (partially functional):
- `v3/security-auditor.md`
- `v3/memory-specialist.md`
- `v3/performance-engineer.md`
- And more...

## Installation of Removed Agents

Users who need Flow Nexus or agentic-payments agents can install them:

```bash
# Add Flow Nexus MCP server
claude mcp add flow-nexus -- npx -y flow-nexus@latest mcp start

# Add agentic-payments MCP server  
claude mcp add agentic-payments -- npx -y agentic-payments@latest mcp
```

**Note:** The `sublinear-time-solver` MCP server does not exist as a published package.

## Impact

- **Before:** 108 agent files, 1.2MB, ~300K tokens
- **After:** 86 agent files, 1.1MB, ~215K tokens
- **Savings:** 22 files, ~100KB, ~85K tokens (~28% reduction)

This reduces the context bloat on every Claude Code conversation without removing any functionality for standard installations.
