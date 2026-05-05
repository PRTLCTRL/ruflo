# Optional Ruflo Agents

This directory contains **93 optional agents** that are **not loaded by default** to minimize context overhead. Many require external MCP servers that don't ship with standard Ruflo installations.

## Why Optional?

These agents were moved out of the core set because:

1. **Non-functional dependencies** - Require MCP servers not included in Ruflo (`flow-nexus`, `sublinear-time-solver`, `agentic-payments`)
2. **Niche use cases** - Specialized for specific methodologies or workflows (SPARC, consensus protocols)
3. **Redundancy** - Generic wrappers around capabilities the core `coder`/`planner` agents already handle
4. **Context overhead** - Loading all agents adds ~300K tokens per conversation

## Installation

### Install Entire Category

```bash
# Copy a full category back to active agents
cp -r .claude/agents-optional/github-extended .claude/agents/
```

### Install Single Agent

```bash
# Copy just one agent
cp .claude/agents-optional/v3-specialized/memory-specialist.md .claude/agents/
```

### Temporary Use (No Installation)

You can reference agent prompts directly without installing:

```bash
# Read optional agent definition
cat .claude/agents-optional/sparc/specification.md
```

## Categories

### ❌ Non-Functional (Require Missing MCP Servers)

#### `flow-nexus/` (9 agents)
Requires `flow-nexus` MCP server for E2B sandbox integration:
- `app-store` - Flow Nexus marketplace
- `authentication` - Flow Nexus auth
- `challenges` - Coding challenges
- `neural-network` - Neural training
- `payments` - Payment integration
- `sandbox` - E2B sandbox management
- `swarm` - Flow Nexus swarm coord
- `user-tools` - User management
- `workflow` - Workflow automation

**Installation:** `npm install -g flow-nexus@latest` + `flow-nexus mcp start`

#### `sublinear/` (5 agents)
Requires `sublinear-time-solver` MCP server (does not exist publicly):
- `trading-predictor` - Financial trading with "temporal advantage" (marketing copy)
- `performance-optimizer` - Sublinear performance optimization
- `pagerank-analyzer` - PageRank with sublinear algorithms
- `matrix-optimizer` - Matrix optimization
- `consensus-coordinator` - Consensus with sublinear algorithms

**Status:** MCP server not available. Agents are non-functional.

#### `payments/` (1 agent)
Requires `agentic-payments` MCP server:
- `agentic-payments` - Multi-agent payment authorization with Byzantine consensus

**Installation:** Contact Agentics Foundation for agentic-payments MCP access.

### ⚠️ Partially Functional (Advanced/Internal)

#### `consensus/` (7 agents)
Byzantine fault-tolerant consensus protocols:
- `byzantine-coordinator` - BFT coordination
- `raft-manager` - Raft consensus
- `gossip-coordinator` - Gossip protocol
- `crdt-synchronizer` - CRDT sync
- `quorum-manager` - Quorum management
- `security-manager` - Consensus security
- `performance-benchmarker` - Consensus benchmarking

**Notes:** Work with ruflo MCP but are advanced use cases.

#### `v3-specialized/` (16 agents)
V3 internal architecture agents:
- `security-architect` - Security design
- `memory-specialist` - AgentDB specialist
- `performance-engineer` - V3 performance
- `integration-architect` - Integration design
- `queen-coordinator` - V3 queen coordination
- `aidefence-guardian` - AIDefence integration
- `pii-detector` - PII detection
- `injection-analyst` - Injection analysis
- `claims-authorizer` - Claims authorization
- `ddd-domain-expert` - DDD expert
- `adr-architect` - ADR specialist
- `reasoningbank-learner` - ReasoningBank learning
- `swarm-memory-manager` - Memory coordination
- `sparc-orchestrator` - SPARC coordinator
- `collective-intelligence-coordinator` - Collective intelligence
- `security-architect-aidefence` - AIDefence security

**Notes:** Reference internal V3 architecture. Useful if customizing Ruflo internals.

#### `optimization/` (5 agents)
Generic optimization agents:
- `topology-optimizer` - Network topology optimization
- `resource-allocator` - Resource allocation
- `performance-monitor` - Performance monitoring
- `load-balancer` - Load balancing
- `benchmark-suite` - Benchmarking suite

**Notes:** Generic. Limited project-specific value. Core agents handle most optimization needs.

### ✅ Functional (Opt-In)

#### `github-extended/` (10 agents)
Extended GitHub operations beyond core 3:
- `workflow-automation` - GitHub Actions
- `sync-coordinator` - Multi-repo sync
- `swarm-pr` - PR swarm coordination
- `swarm-issue` - Issue swarm coordination
- `repo-architect` - Repository architecture
- `release-swarm` - Release coordination
- `release-manager` - Release management
- `project-board-sync` - Project boards
- `multi-repo-swarm` - Multi-repo coordination
- `github-modes` - GitHub mode switching

**Use when:** Managing complex GitHub workflows, multi-repo projects, or automated releases.

#### `sparc/` (4 agents)
SPARC methodology (Specification, Pseudocode, Architecture, Refinement, Completion):
- `specification` - Requirements specification
- `pseudocode` - Algorithm design
- `architecture` - System architecture
- `refinement` - Iterative refinement

**Use when:** Following SPARC methodology for structured development.

#### `templates/` (9 agents)
Template and boilerplate generation:
- `sparc-coordinator` - SPARC coordination
- `performance-analyzer` - Performance analysis
- `orchestrator-task` - Task orchestration
- `migration-plan` - Migration planning
- `memory-coordinator` - Memory coordination
- `implementer-sparc-coder` - SPARC implementation
- `github-pr-manager` - PR management (duplicate)
- `coordinator-swarm-init` - Swarm initialization
- `automation-smart-agent` - Smart automation

**Use when:** Generating boilerplate for new projects or features.

#### Other Functional Categories

- `hive-mind/` (5 agents) - Advanced queen-led swarm coordination
- `neural/` (1 agent) - SONA neural optimization
- `language-specialists/` (2 agents) - Python/TypeScript specialists
- `development/` (1 agent) - Backend API development
- `analysis/` (1 agent) - Advanced code analysis
- `architecture/` (1 agent) - System architecture design
- `devops/` (1 agent) - CI/CD with GitHub Actions
- `documentation/` (1 agent) - OpenAPI documentation
- `data/` (1 agent) - ML model development
- `specialized/` (1 agent) - Mobile React Native development
- `dual-mode/` (agents) - Dual-mode Claude Code + Codex collaboration

## Custom Agent Development

Create your own agents in `.claude/agents/custom/`:

```markdown
---
name: my-custom-agent
description: Custom agent for specific needs
---

You are a custom agent specialized in [domain].

Your core responsibilities:
- [Responsibility 1]
- [Responsibility 2]

Your toolkit:
```javascript
// MCP tools you can use
mcp__tool_name({ param: "value" })
```

Your workflow:
1. [Step 1]
2. [Step 2]
3. [Step 3]
```

## Migration Note

Before v3.6.13, Ruflo shipped all 108 agents by default, costing ~300K tokens per conversation. Issue #1504 moved 93 agents to optional to reduce context overhead by 86%.

## See Also

- Core agents: [.claude/agents/README.md](../.claude/agents/README.md)
- Issue #1504: https://github.com/ruvnet/ruflo/issues/1504
- MCP server docs: https://github.com/ruvnet/ruflo/docs/mcp.md
