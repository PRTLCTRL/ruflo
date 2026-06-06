# Agent Definitions Cleanup (Issue #1504)

## Summary

Removed 18 non-functional and duplicate agent definitions to reduce context bloat.

## What Was Removed

### Non-functional Agents (15 files)

These agents reference MCP servers that do not ship with standard Ruflo installations:

#### Flow Nexus Agents (9 files, ~32KB)
- `flow-nexus/app-store.md`
- `flow-nexus/authentication.md`
- `flow-nexus/challenges.md`
- `flow-nexus/neural-network.md`
- `flow-nexus/payments.md`
- `flow-nexus/sandbox.md`
- `flow-nexus/swarm.md`
- `flow-nexus/user-tools.md`
- `flow-nexus/workflow.md`

**Reason**: All reference `mcp__flow-nexus__*` tools from the Flow Nexus SaaS platform. This MCP server is not included in `npx ruflo@latest` installations.

#### Sublinear Agents (5 files, ~55KB)
- `sublinear/consensus-coordinator.md`
- `sublinear/matrix-optimizer.md`
- `sublinear/pagerank-analyzer.md`
- `sublinear/performance-optimizer.md`
- `sublinear/trading-predictor.md`

**Reason**: All reference `mcp__sublinear-time-solver__*` tools which do not exist in any standard installation. These were marketing material, not functional agents.

#### Payments Agent (1 file, ~5KB)
- `payments/agentic-payments.md`

**Reason**: References `mcp__agentic-payments__*` tools which are not installed by default.

### Duplicate Agents (3 files)

These were nested duplicates of parent definitions:

- `analysis/code-review/analyze-code-quality.md` (duplicate of `analysis/analyze-code-quality.md`)
- `testing/unit/tdd-london-swarm.md` (duplicate of `testing/tdd-london-swarm.md`)
- `testing/validation/production-validator.md` (duplicate of `testing/production-validator.md`)

## What Remains (90 agents)

### Core Development Agents (5)
Essential agents for day-to-day development:
- `core/coder.md` - Code implementation
- `core/planner.md` - Task planning
- `core/researcher.md` - Analysis and research
- `core/reviewer.md` - Code review
- `core/tester.md` - Test creation

### GitHub Integration (13)
Agents for GitHub workflow automation:
- `github/pr-manager.md`
- `github/issue-tracker.md`
- `github/code-review-swarm.md`
- Plus 10 more for releases, multi-repo coordination, etc.

### Swarm Coordination (3)
- `swarm/hierarchical-coordinator.md`
- `swarm/mesh-coordinator.md`
- `swarm/adaptive-coordinator.md`

### V3 Specialists (10)
Security, memory, performance, and integration specialists

### Other Categories
- Analysis (2)
- Architecture (1)
- Consensus (7)
- Custom (1)
- Data (1)
- Development (2)
- DevOps (1)
- Documentation (1)
- Dual-mode (3)
- Goal planning (3)
- Hive-mind (5)
- Neural (1)
- Optimization (5)
- Reasoning (2)
- SONA (1)
- SPARC (4)
- Specialized (1)
- Templates (9)
- Testing (2)

## Impact

**Before:**
- 108 agent files
- ~827 KB markdown content
- ~1.2 MB total directory size

**After:**
- 90 agent files (-16.7%)
- ~716 KB markdown content (-13.4%)
- All agents reference tools available in standard installations

**Token Savings:**
Estimated ~30K-40K tokens removed from context window on agent-heavy conversations.

## Future Optimization Opportunities

Per issue #1504, further reduction is possible:

1. **Lazy loading** - Only load agent definitions when first used
2. **Minimal core set** - Ship only ~15 most-used agents by default
3. **Opt-in registry** - Move specialized agents to installable plugins
4. **Size audit** - Trim verbose agent definitions to <2KB each

This cleanup addresses the immediate problem of non-functional agents without requiring architectural changes to implement lazy loading or a plugin system.

## Related

- Issue: #1504 - Agent definition bloat
- Commit: af020283b "Remove non-functional agents and duplicates"
