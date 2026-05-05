# Optional Agent Definitions

This directory contains additional agent definitions that are **not loaded by default** to reduce token consumption and avoid dependency errors.

## Why These Are Optional

The agents in this directory either:

1. **Require external MCP servers** that don't ship with Ruflo (e.g., `flow-nexus`, `sublinear-time-solver`, `agentic-payments`)
2. **Are duplicates** of agents already available in the main agents directory
3. **Are advanced/specialized** for niche use cases that most users won't need

## Categories

| Directory | Count | Description | MCP Dependencies |
|-----------|-------|-------------|------------------|
| `flow-nexus/` | 9 | Flow Nexus cloud platform agents | Requires `flow-nexus` MCP server |
| `sublinear/` | 5 | Sublinear goal-oriented planning agents | Requires `sublinear-time-solver` MCP server |
| `extra/consensus/` | 7 | Byzantine, Raft, CRDT, Gossip consensus | Ruflo MCP (optional) |
| `extra/optimization/` | 5 | Performance monitoring, load balancing | Ruflo MCP (optional) |
| `extra/neural/` | 1 | SAFLA neural training | Ruflo MCP (optional) |
| `extra/templates/` | 9 | Agent templates and scaffolding | None |
| `duplicates/` | 7 | Duplicate agent files from nested directories | None |

**Total optional agents:** 40+

## How to Enable Optional Agents

### Option 1: Enable All Optional Agents

Move all optional agents back into the main directory:

```bash
cd /workspace/v2/.claude
cp -r agents-optional/flow-nexus agents/
cp -r agents-optional/sublinear/goal agents/
cp -r agents-optional/extra/* agents/
```

### Option 2: Enable Specific Categories

Only enable the categories you need:

```bash
# Enable Flow Nexus agents (requires flow-nexus MCP)
cp -r agents-optional/flow-nexus agents/

# Enable consensus agents
cp -r agents-optional/extra/consensus agents/

# Enable optimization agents
cp -r agents-optional/extra/optimization agents/
```

### Option 3: Enable Individual Agents

Copy specific agent files you need:

```bash
# Enable a specific agent
cp agents-optional/flow-nexus/payments.md agents/flow-nexus/
```

## MCP Server Setup

Some optional agents require external MCP servers:

### Flow Nexus Platform

```bash
# Add Flow Nexus MCP server
claude mcp add flow-nexus npx flow-nexus@latest mcp start

# Authenticate (required)
npx flow-nexus@latest register
npx flow-nexus@latest login
```

### Ruflo Advanced Features

```bash
# Add Ruflo MCP server (for consensus, optimization, neural features)
claude mcp add ruv-swarm npx ruv-swarm mcp start
```

## Performance Impact

Loading all agents (including optional) increases context size by:

- **~520KB of markdown content**
- **~130K tokens per conversation**
- **~$1.95 per conversation on Opus** (at $0.015/1K input tokens)

By keeping optional agents disabled, you save this cost on every interaction where agents are loaded.

## Core Agents (Always Available)

The 36 core agents in the main `agents/` directory are:

### Core Development (5)
- `coder`, `reviewer`, `tester`, `planner`, `researcher`

### GitHub Integration (13)
- `pr-manager`, `issue-tracker`, `code-review-swarm`, `github-modes`
- `multi-repo-swarm`, `project-board-sync`, `release-manager`, `release-swarm`
- `repo-architect`, `swarm-issue`, `swarm-pr`, `sync-coordinator`, `workflow-automation`

### Swarm Coordination (3)
- `hierarchical-coordinator`, `mesh-coordinator`, `adaptive-coordinator`

### Hive Mind (5)
- `queen-coordinator`, `collective-intelligence-coordinator`, `scout-explorer`
- `swarm-memory-manager`, `worker-specialist`

### SPARC Methodology (4)
- `specification`, `pseudocode`, `architecture`, `refinement`

### Analysis (1)
- `code-analyzer`

### Testing (2)
- `tdd-london-swarm`, `production-validator`

### Planning (2)
- `goal-planner`, `agent` (reasoning)

### Misc (1)
- `base-template-generator`

## See Also

- [Issue #1504](https://github.com/ruvnet/ruflo/issues/1504) - Original bug report about agent bloat
- [Ruflo Documentation](../../README.md)
