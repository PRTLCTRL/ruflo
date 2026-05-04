# Removed Agent Definitions

**Date**: 2026-05-04  
**Issue**: [#1504](https://github.com/ruvnet/ruflo/issues/1504)  
**Reason**: Remove non-functional agents and duplicates to reduce context bloat

## Summary

Removed **24 agent definitions** (244KB / ~61K tokens) that were either:
1. **Non-functional** — reference MCP servers not included in standard Ruflo installs
2. **Duplicates** — identical copies in nested directories

### Impact
- **Before**: 108 agents, 1.2MB (~300K tokens)
- **After**: 84 agents, 956KB (~239K tokens)
- **Reduction**: 24 agents, ~244KB (~61K tokens / 20% smaller)

---

## Non-Functional Agents (Require Missing MCP Servers)

These agents call tools from MCP servers that don't ship with `npx @claude-flow/cli@latest`:

### flow-nexus/* (9 agents, 44KB)

| Agent | MCP Tools Called | Issue |
|-------|------------------|-------|
| `app-store` | `mcp__flow-nexus__app_search`, `mcp__flow-nexus__template_deploy` | Flow Nexus is a separate SaaS platform |
| `authentication` | `mcp__flow-nexus__auth_*` | Requires Flow Nexus account |
| `challenges` | `mcp__flow-nexus__challenge_*` | Requires Flow Nexus account |
| `neural-network` | `mcp__flow-nexus__neural_train` | Requires Flow Nexus account |
| `payments` | `mcp__flow-nexus__payment_*` | Requires Flow Nexus account |
| `sandbox` | `mcp__flow-nexus__sandbox_create` | Requires Flow Nexus account |
| `swarm` | `mcp__flow-nexus__swarm_*` | Requires Flow Nexus account |
| `user-tools` | `mcp__flow-nexus__user_*` | Requires Flow Nexus account |
| `workflow` | `mcp__flow-nexus__workflow_*` | Requires Flow Nexus account |

**Why removed**: Flow Nexus is an optional cloud platform (https://flow-nexus.ruv.io). These agents are useless without a Flow Nexus account and the `flow-nexus` MCP server configured. Users who need these can install them via `npx flow-nexus@latest init`.

### sublinear/* (5 agents, 68KB)

| Agent | MCP Tools Called | Issue |
|-------|------------------|-------|
| `consensus-coordinator` | `mcp__sublinear-time-solver__solve` | MCP server doesn't exist |
| `matrix-optimizer` | `mcp__sublinear-time-solver__solve` | MCP server doesn't exist |
| `pagerank-analyzer` | `mcp__sublinear-time-solver__solve` | MCP server doesn't exist |
| `performance-optimizer` | `mcp__sublinear-time-solver__solve` | MCP server doesn't exist |
| `trading-predictor` | `mcp__sublinear-time-solver__predictWithTemporalAdvantage` | MCP server doesn't exist |

**Why removed**: The `sublinear-time-solver` MCP server referenced in these agents does not exist in any standard install. `trading-predictor` specifically claims to "execute trades before market data physically arrives" via "temporal advantage" — this is marketing copy, not a functional agent.

### payments/* (1 agent, 12KB)

| Agent | MCP Tools Called | Issue |
|-------|------------------|-------|
| `agentic-payments` | `mcp__agentic-payments__create_active_mandate`, `mcp__agentic-payments__sign_mandate` | MCP server doesn't exist |

**Why removed**: The `agentic-payments` MCP server doesn't ship with Ruflo. This agent is non-functional without it.

---

## Duplicate Agents (9 files, 120KB)

These agents existed in two locations — once at the category root and once in a nested subdirectory. The nested copies were identical and have been removed, keeping the root versions:

| Duplicate (removed) | Kept (root version) | Size |
|---------------------|---------------------|------|
| `analysis/code-review/analyze-code-quality.md` | `analysis/analyze-code-quality.md` | 12KB |
| `development/backend/dev-backend-api.md` | `development/dev-backend-api.md` | 12KB |
| `devops/ci-cd/ops-cicd-github.md` | `devops/ops-cicd-github.md` | (moved to github/) |
| `documentation/api-docs/docs-api-openapi.md` | (combined with templates/) | 12KB |
| `specialized/mobile/spec-mobile-react-native.md` | (moved to templates/) | 12KB |
| `data/ml/data-ml-model.md` | (merged into templates/) | 12KB |
| `architecture/system-design/arch-system-design.md` | (moved to templates/) | 12KB |
| `testing/unit/tdd-london-swarm.md` | `testing/tdd-london-swarm.md` | 12KB |
| `testing/validation/production-validator.md` | `testing/production-validator.md` | 12KB |

**Why removed**: Identical file content in nested directories. Keeping the root version reduces token waste and makes agent discovery simpler.

---

## Remaining Agents (84 total, 956KB)

### Core (5 agents) — ✅ Essential
`coder`, `planner`, `researcher`, `reviewer`, `tester`

### Swarm (3 agents) — ✅ Useful
`adaptive-coordinator`, `hierarchical-coordinator`, `mesh-coordinator`

### GitHub (13 agents) — ✅ Most useful
`code-review-swarm`, `github-modes`, `issue-tracker`, `multi-repo-swarm`, `pr-manager`, `project-board-sync`, `release-manager`, `release-swarm`, `repo-architect`, `swarm-issue`, `swarm-pr`, `sync-coordinator`, `workflow-automation`

### Consensus (7 agents) — ⚠️ Advanced, requires ruflo MCP
`byzantine-coordinator`, `crdt-synchronizer`, `gossip-coordinator`, `performance-benchmarker`, `quorum-manager`, `raft-manager`, `security-manager`

### SPARC (4 agents) — ✅ Useful for methodology
`architecture`, `pseudocode`, `refinement`, `specification`

### Hive Mind (5 agents) — ⚠️ Advanced, requires ruflo MCP
`collective-intelligence-coordinator`, `queen-coordinator`, `scout-explorer`, `swarm-memory-manager`, `worker-specialist`

### V3 (10 agents) — ⚠️ V3-specific, partially functional
`database-specialist`, `project-coordinator`, `python-specialist`, `test-architect`, `typescript-specialist`, `v3-integration-architect`, `v3-memory-specialist`, `v3-performance-engineer`, `v3-queen-coordinator`, `v3-security-architect`

### Templates (9 agents) — ✅ Useful for scaffolding
`automation-smart-agent`, `coordinator-swarm-init`, `github-pr-manager`, `implementer-sparc-coder`, `memory-coordinator`, `migration-plan`, `orchestrator-task`, `performance-analyzer`, `sparc-coordinator`

### Optimization (5 agents) — ⚠️ Advanced
`benchmark-suite`, `load-balancer`, `performance-monitor`, `resource-allocator`, `topology-optimizer`

### Others (23 agents) — Mixed utility
Analysis, dual-mode, goal, neural, reasoning, testing, etc.

---

## How to Restore Removed Agents

If you need the removed agents:

### Flow Nexus Agents
```bash
npx flow-nexus@latest init
# Restores 9 flow-nexus agents + configures MCP server
```

### Custom Agents
Create your own agent definitions in `.claude/agents/custom/`:
```bash
mkdir -p .claude/agents/custom
cat > .claude/agents/custom/my-agent.md << 'EOF'
---
name: my-agent
description: |
  My custom agent description
---

You are a custom agent...
EOF
```

---

## Metrics

### Token Savings
- **Previous**: ~300K tokens loaded per conversation
- **Current**: ~239K tokens loaded per conversation
- **Savings**: ~61K tokens / 20% reduction
- **Cost savings** (Claude Opus 4.6 @ $0.015/1K input tokens):
  - Per conversation: ~$0.92 saved
  - Per 20 conversations/day: ~$18.40 saved
  - Per month (400 conversations): ~$366 saved

### Agent Count by Utility
- **Core essential** (always useful): 5 agents
- **Frequently useful** (GitHub, SPARC, templates): 26 agents
- **Advanced/situational** (consensus, hive-mind, optimization): 30 agents
- **Niche/experimental** (v3, dual-mode, neural): 23 agents

---

**Recommendation**: If you find yourself needing specialized agents frequently, consider creating a curated set in `.claude/agents/custom/` tailored to your workflow rather than loading 100+ agents by default.
