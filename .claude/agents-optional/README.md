# Optional Agent Definitions

This directory contains **agent definitions that require additional MCP servers** not included in the standard Ruflo installation. These agents are not shipped with the npm package by default to reduce context bloat.

## Why These Agents Are Optional

By default, Ruflo ships ~55 core agents (~630KB) that work out-of-the-box. The agents in this directory (~50 additional agents, ~560KB) require external dependencies:

### Requires External MCP Servers

| Category | Agents | Dependency |
|----------|--------|------------|
| `flow-nexus/` | 9 agents | `flow-nexus` MCP server (SaaS platform) |
| `sublinear/` | 5 agents | `sublinear-time-solver` MCP server (not distributed) |
| `payments/` | 1 agent | `agentic-payments` MCP server (not distributed) |
| `optimization/` | 5 agents | Generic, low differentiation from core agents |
| `goal/` | 2 agents | GOAP planners (niche use case) |
| `neural/`, `sona/` | 2 agents | Advanced neural training (niche) |
| `v3/` | ~16 agents | Internal v3 architecture agents |
| `templates/` | 9 agents | Template agents (rarely used) |

Plus consensus agents that were moved here (byzantine-coordinator, crdt-synchronizer, gossip-coordinator, quorum-manager, raft-manager, security-manager, performance-benchmarker).

## Using These Agents

### Option A: Copy to Main Directory

If you have the required MCP server installed, copy the agent(s) you need:

```bash
# Copy a specific agent category
cp -r .claude/agents-optional/flow-nexus .claude/agents/

# Or copy a single agent
cp .claude/agents-optional/payments/agentic-payments.md .claude/agents/payments/
```

### Option B: Install the Required MCP Server

Some of these agents require MCP servers that can be installed:

```bash
# Flow Nexus (requires authentication)
claude mcp add flow-nexus -- npx flow-nexus@latest mcp start

# Agentic Payments
# (Check https://github.com/ruvnet/agentic-payments for installation)
```

### Option C: Use Core Agents Instead

Many specialized agents duplicate functionality already available in core agents. For example:

- Instead of `matrix-optimizer` → use `coder` or `planner`
- Instead of `trading-predictor` → use `researcher` + `coder`
- Instead of `pagerank-analyzer` → use `researcher` + `data-analyst`

The core agents (`coder`, `planner`, `researcher`, `tester`, `reviewer`) with good prompts can handle most tasks these specialized agents claim to do.

## Impact

Removing these agents from the default distribution:

- **Reduces npm package size** by ~560KB (~50% smaller)
- **Reduces token overhead** by ~150K tokens per conversation
- **Eliminates "agent not found" errors** for agents that reference missing MCP servers
- **Improves agent discoverability** by showing only functional agents in error messages

## Restoring All Agents

If you want all agents available (including non-functional ones):

```bash
# Copy everything back
cp -r .claude/agents-optional/* .claude/agents/
```

Or install from source/fork with all agents included.
