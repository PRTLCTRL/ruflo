# Removed Agent Definitions

This document tracks agent definitions removed to reduce context bloat and eliminate non-functional agents.

## Summary

**Removed:** 24 agent definition files  
**Size reduction:** ~149KB (18% smaller)  
**Before:** 108 agents / 807KB  
**After:** 84 agents / 658KB

## Why These Were Removed

### 1. Non-Functional Agents (17 files, ~110KB)

These agents reference MCP servers that don't ship with standard Ruflo installations. They will always fail when spawned.

#### Flow Nexus Agents (9 files)
**MCP dependency:** `mcp__flow-nexus__*` (requires Flow Nexus SaaS platform)

- `flow-nexus/app-store.md`
- `flow-nexus/authentication.md`
- `flow-nexus/challenges.md`
- `flow-nexus/neural-network.md`
- `flow-nexus/payments.md`
- `flow-nexus/sandbox.md`
- `flow-nexus/swarm.md`
- `flow-nexus/user-tools.md`
- `flow-nexus/workflow.md`

#### Sublinear Time Solver Agents (5 files)
**MCP dependency:** `mcp__sublinear-time-solver__*` (server doesn't exist)

- `sublinear/consensus-coordinator.md`
- `sublinear/matrix-optimizer.md`
- `sublinear/pagerank-analyzer.md`
- `sublinear/performance-optimizer.md`
- `sublinear/trading-predictor.md`

#### Goal Planning Agents (2 files)
**MCP dependencies:** Both `mcp__sublinear-time-solver__*` and `mcp__flow-nexus__*`

- `reasoning/agent.md`
- `goal/agent.md`

#### Payments Agent (1 file)
**MCP dependency:** `mcp__agentic-payments__*` (not installed by default)

- `payments/agentic-payments.md`

### 2. Duplicate Agent Files (7 files, ~39KB)

These agents existed in both a root category and a nested subdirectory. The nested duplicates were removed.

- `analysis/code-review/analyze-code-quality.md` (duplicate of `analysis/analyze-code-quality.md`)
- `architecture/system-design/arch-system-design.md` (duplicate of `architecture/arch-system-design.md`)
- `data/ml/data-ml-model.md` (duplicate of `data/data-ml-model.md`)
- `development/backend/dev-backend-api.md` (duplicate of `development/dev-backend-api.md`)
- `devops/ci-cd/ops-cicd-github.md` (duplicate of `devops/ops-cicd-github.md`)
- `documentation/api-docs/docs-api-openapi.md` (duplicate of `documentation/docs-api-openapi.md`)
- `specialized/mobile/spec-mobile-react-native.md` (duplicate of `specialized/spec-mobile-react-native.md`)

## What Remains

The remaining 84 agents are functional with standard Ruflo installations:

### Core Agents (5)
- `core/coder.md`
- `core/planner.md`
- `core/researcher.md`
- `core/reviewer.md`
- `core/tester.md`

### GitHub Agents (13)
- PR management, issue tracking, code review coordination
- All functional with standard GitHub access

### Swarm Coordination (3)
- `swarm/hierarchical-coordinator.md`
- `swarm/mesh-coordinator.md`
- `swarm/adaptive-coordinator.md`

### V3 Specialized (16)
- Security, memory, performance specialists
- Functional with Ruflo's built-in MCP server

### Templates & Others (47)
- SPARC methodology, architecture, testing, etc.
- All functional or template-based

## Installation of Removed Agents

If you need Flow Nexus or other external agent types:

```bash
# Flow Nexus agents (requires Flow Nexus account + MCP setup)
ruflo agents install flow-nexus

# Sublinear solver agents (when/if the MCP server is published)
ruflo agents install sublinear

# Agentic payments (requires agentic-payments MCP server)
ruflo agents install agentic-payments
```

## Related Issues

- Fixes #1504 - [Bug] 106 agent definitions ship by default — ~300K tokens of context bloat
