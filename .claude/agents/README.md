# Agent Definitions

This directory contains agent definitions for Ruflo. Agents are specialized AI workers that can be spawned to handle specific tasks.

## Core Agents (Always Available)

These agents work out of the box with no additional dependencies:

### Essential Core (5 agents)
- **coder** - Implementation specialist for writing clean, efficient code
- **planner** - Strategic planning and task decomposition
- **researcher** - Deep research and information gathering
- **reviewer** - Code review and quality assurance
- **tester** - Comprehensive testing and QA

### GitHub Integration (3 agents)
- **github/pr-manager** - PR creation and management
- **github/issue-tracker** - Issue tracking and triage
- **github/code-review-swarm** - Coordinated code review

### Swarm Coordination (3 agents)
- **swarm/hierarchical-coordinator** - Hierarchical swarm orchestration
- **swarm/mesh-coordinator** - Peer-to-peer coordination
- **swarm/adaptive-coordinator** - Dynamic topology switching

### SPARC Methodology (4 agents)
- **sparc/specification** - Requirements and specs
- **sparc/pseudocode** - Algorithm design
- **sparc/architecture** - System architecture
- **sparc/refinement** - Iterative improvement

### Analysis & Quality (2 agents)
- **analysis/code-analyzer** - Advanced code analysis
- **security-auditor** - Security scanning and auditing

### Utilities (2 agents)
- **base-template-generator** - Boilerplate generation
- **templates/implementer-sparc-coder** - SPARC implementation

**Total Core: ~19 agents**

## Optional/Advanced Agents

The following agent categories are available but may require additional MCP servers or specific configurations:

### V3 Specialized (10 agents in v3/)
Project-specific agents for internal v3 development.

### Consensus & Distributed (7 agents in consensus/)
Requires distributed systems setup: byzantine-coordinator, raft-manager, gossip-coordinator, etc.

### Optimization (5 agents in optimization/)
Performance tuning and resource management.

### Hive Mind (5 agents in hive-mind/)
Collective intelligence - requires ruflo MCP server.

### Templates (9 agents in templates/)
Generic wrappers and scaffolding.

### GitHub Extended (10 agents in github/)
Additional GitHub automation beyond core pr-manager and issue-tracker.

### Testing Extended (2 agents in testing/)
Advanced testing coordination.

## Removed (Non-Functional)

The following agent types were removed because they reference MCP servers not included in standard installations:

- **flow-nexus/** (9 agents) - Requires Flow Nexus platform
- **sublinear/** (5 agents) - Requires sublinear-time-solver MCP server
- **payments/agentic-payments** - Requires agentic-payments MCP server
- **goal/** and **reasoning/** - Depended on the above

These can be reinstalled via:
```bash
ruflo agents install flow-nexus    # if you have Flow Nexus configured
ruflo agents install sublinear     # if you have sublinear-time-solver
```

## Agent Size Limits

To prevent context bloat, agent definitions should be:
- **< 5KB** for simple agents
- **< 15KB** for complex agents with examples
- **Total < 300KB** for all shipped agents

Current size: ~656KB for 80 agents (still too high)

## Contributing

When adding new agents:
1. Ensure they work with standard installation (no missing MCP dependencies)
2. Keep descriptions concise - verbose instructions belong in skills
3. Avoid duplicates - check for existing agents first
4. Add to "optional" directory if requires additional setup

See [Issue #1504](https://github.com/ruvnet/ruflo/issues/1504) for context.
