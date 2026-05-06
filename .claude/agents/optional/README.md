# Optional Agent Definitions

This directory contains agent definitions that require **external MCP servers** not included in the standard Ruflo installation.

## Why are these optional?

These agents reference MCP tools from servers that are:
- Not installed by default
- External services or separate products
- Platform-specific integrations

Attempting to use these agents without the required MCP server will result in errors like:

```
Error: MCP tool 'mcp__flow-nexus__app_search' not found
```

## Available Optional Agent Packages

### Flow Nexus Agents (9 agents)
**Requires:** `flow-nexus` MCP server (https://flow-nexus.ruv.io)

Agents in `optional/flow-nexus/`:
- `app-store` - Application marketplace management
- `authentication` - User authentication and authorization
- `challenges` - Coding challenges and competitions
- `neural-network` - Neural network training
- `payments` - Payment processing integration
- `sandbox` - Sandboxed code execution
- `swarm` - Cloud-based swarm orchestration
- `user-tools` - User management tools
- `workflow` - Workflow automation

**To enable:**
```bash
# Install Flow Nexus MCP server
npx flow-nexus@latest init

# Register account
npx flow-nexus@latest register

# Add to Claude Code
claude mcp add flow-nexus npx flow-nexus@latest mcp start
```

### Sublinear Agents (5 agents)
**Requires:** `sublinear-time-solver` MCP server (currently unavailable)

Agents in `optional/sublinear/`:
- `consensus-coordinator` - Consensus algorithms
- `matrix-optimizer` - Matrix optimization
- `pagerank-analyzer` - PageRank analysis
- `performance-optimizer` - Performance optimization
- `trading-predictor` - Trading predictions

**Note:** This MCP server is not currently available. These agents are non-functional.

### Payment Agents (1 agent)
**Requires:** `agentic-payments` MCP server

Agent in `optional/payments/`:
- `agentic-payments` - Payment processing

**To enable:**
```bash
# Add agentic-payments MCP server
claude mcp add agentic-payments npx agentic-payments@latest mcp start
```

## How to Enable Optional Agents

### Method 1: Copy to Main Agents Directory

```bash
# Enable Flow Nexus agents (after installing the MCP server)
cp -r .claude/agents/optional/flow-nexus .claude/agents/

# Refresh agent cache
npx ruflo@latest agent list --refresh
```

### Method 2: Symlink for Development

```bash
# Create symlink to enable Flow Nexus agents
ln -s $(pwd)/.claude/agents/optional/flow-nexus .claude/agents/flow-nexus-enabled
```

### Method 3: Environment Variable (Future)

In a future release, you'll be able to enable optional agents via config:

```bash
# .env or ruflo config
RUFLO_OPTIONAL_AGENTS="flow-nexus,payments"
```

## Core Agents (Always Available)

The main `.claude/agents/` directory contains **~77 agents** that work out of the box with the standard Ruflo installation:

- **Core:** `coder`, `reviewer`, `tester`, `planner`, `researcher`
- **GitHub:** `pr-manager`, `issue-tracker`, `code-review-swarm`, etc.
- **Swarm:** `hierarchical-coordinator`, `mesh-coordinator`, etc.
- **V3:** `security-auditor`, `memory-specialist`, `performance-engineer`, etc.
- **And more...**

These agents require no additional MCP servers and are production-ready.

## Impact of This Change

**Before:** 108 agent definitions (~827KB), many non-functional  
**After:** 77 core agents (~620KB), 15 optional agents (~207KB)

**Token savings per session:** ~50-70K tokens (depending on conversation length)  
**Cost savings on Opus:** ~$0.75-$1.05 per conversation  

## Contributing

If you've built an MCP server and want to contribute agent definitions:

1. Add agent definitions to `optional/your-mcp-name/`
2. Include a README with setup instructions
3. Submit a PR with clear documentation of dependencies

## Questions?

See [issue #1504](https://github.com/ruvnet/ruflo/issues/1504) for context on why this reorganization was done.
