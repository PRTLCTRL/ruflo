# Agent Cleanup Summary

**Related Issue:** [#1504](https://github.com/ruvnet/ruflo/issues/1504)  
**Date:** 2026-05-23  
**Change Type:** Removal of non-functional agents

## What Changed

Removed **19 agent definition files** (220KB, ~55K tokens) that reference MCP servers not included in a standard Ruflo installation.

### Before
- **108 agent files**
- **1.2MB total size**
- ~300K tokens loaded per conversation

### After
- **89 agent files**
- **980KB total size**
- ~245K tokens per conversation

## Files Removed

### 1. flow-nexus agents (9 files, 32KB)
**Reason:** These agents require the `flow-nexus` MCP server which is optional and requires separate authentication. Most users don't have it configured.

- `flow-nexus/app-store.md`
- `flow-nexus/authentication.md`
- `flow-nexus/challenges.md`
- `flow-nexus/neural-network.md`
- `flow-nexus/payments.md`
- `flow-nexus/sandbox.md`
- `flow-nexus/swarm.md`
- `flow-nexus/user-tools.md`
- `flow-nexus/workflow.md`

### 2. sublinear agents (5 files, 55KB)
**Reason:** These agents require the `sublinear-time-solver` MCP server which doesn't exist in any standard installation.

- `sublinear/consensus-coordinator.md`
- `sublinear/matrix-optimizer.md`
- `sublinear/pagerank-analyzer.md`
- `sublinear/performance-optimizer.md`
- `sublinear/trading-predictor.md` (claimed to "execute trades before market data arrives")

### 3. agentic-payments agents (1 file, 5KB)
**Reason:** Requires `agentic-payments` MCP server which is not installed by default.

- `payments/agentic-payments.md`

### 4. Other non-functional agents (2 files)
**Reason:** Reference MCP servers not available in standard installs.

- `reasoning/agent.md` (references `sublinear-time-solver`)
- `goal/agent.md` (references `sublinear-time-solver`)

### 5. Duplicate agents (2 files)
**Reason:** Identical or nearly-identical copies in nested directories.

- `analysis/code-review/analyze-code-quality.md` (duplicate of `analysis/analyze-code-quality.md`)
- `development/backend/dev-backend-api.md` (shorter version of `development/dev-backend-api.md`)

## What Remains

All core, functional agents remain:

- **Core development** (5 agents): `coder`, `reviewer`, `tester`, `planner`, `researcher`
- **GitHub integration** (13 agents): `pr-manager`, `issue-tracker`, `code-review-swarm`, etc.
- **Architecture** (4 agents): `system-architect`, various specialized architects
- **Consensus** (7 agents): `byzantine-coordinator`, `raft-manager`, `gossip-coordinator`, etc.
- **SPARC methodology** (4 agents): `specification`, `pseudocode`, `architecture`, `refinement`
- **Swarm coordination** (3 agents): `hierarchical-coordinator`, `mesh-coordinator`, `adaptive-coordinator`
- **V3 specialists** (10 agents): security, memory, performance engineers, etc.
- **Testing** (4 agents): validation, production checks, TDD support
- **Templates** (9 agents): reusable agent patterns

## Impact

- **~220KB reduction** in agent definitions
- **~55K tokens saved** per conversation
- **No functional loss** — removed agents were already non-functional for most users
- **Cleaner error messages** — agent list in errors is now 19 items shorter

## For Users Who Need flow-nexus Agents

If you use Flow Nexus and need these agents, you can:

1. Keep the old agents in your local fork
2. Create custom agents in `.claude/agents/custom/`
3. Request an opt-in agent registry feature (see Issue #1504 Option A)

## Future Improvements

See [Issue #1504](https://github.com/ruvnet/ruflo/issues/1504) for proposed long-term solutions:

- **Option A:** Opt-in agent registry system
- **Option B:** Lazy loading of agent definitions
- **Option C:** ✅ Done - Remove non-functional agents (this PR)
- **Option D:** Further size optimization (trim verbose agent prompts)
