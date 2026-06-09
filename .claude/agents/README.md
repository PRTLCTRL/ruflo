# Ruflo Agent Definitions

This directory contains 16 core agent definitions that ship with Ruflo. These agents are functional out-of-the-box with a standard Ruflo installation and don't require external MCP servers.

## Core Agents (5)

Essential development agents for day-to-day coding tasks:

- **coder** - Implementation specialist for writing clean, efficient code
- **planner** - Strategic planning and task orchestration
- **researcher** - Deep research and information gathering
- **reviewer** - Code review and quality assurance
- **tester** - Comprehensive testing and validation

## GitHub Integration (2)

Agents that work with the GitHub CLI (`gh`) for repository management:

- **issue-tracker** - GitHub issue management and tracking
- **pr-manager** - Pull request creation, updates, and management

## SPARC Methodology (4)

Structured development methodology agents:

- **architecture** - System architecture and design
- **pseudocode** - Algorithm design and pseudocode generation
- **refinement** - Iterative improvement and refinement
- **specification** - Requirements analysis and specification

## Swarm Coordination (1)

Multi-agent coordination:

- **hierarchical-coordinator** - Queen-led hierarchical swarm coordination with specialized worker delegation

## Testing (2)

Advanced testing strategies:

- **tdd-london-swarm** - TDD London School specialist for mock-driven development
- **production-validator** - Production validation ensuring applications are deployment-ready

## V3 Specialized (2)

V3-specific functionality:

- **v3-memory-specialist** - Memory coordination and AgentDB management
- **v3-security-architect** - Security architecture and CVE remediation

---

## What Was Removed (Issue #1504)

This cleanup removed **92 agent definitions** (~1MB) that were either:

1. **Non-functional** (15 agents) - Referenced MCP servers not included in standard installations:
   - `flow-nexus/*` (9 agents) - Required separate Flow Nexus SaaS platform
   - `sublinear/*` (5 agents) - Required non-existent `sublinear-time-solver` MCP server
   - `payments/agentic-payments` (1 agent) - Required separate payments MCP server

2. **Duplicates** (7+ agents) - Same agent defined in multiple locations

3. **Redundant/Niche** (70+ agents) - Generic functionality already covered by core agents or niche use cases:
   - Consensus algorithms (Byzantine, Raft, Gossip, CRDT, Quorum)
   - Performance optimization specialists
   - Dual-mode coordination
   - Neural network training
   - Goal planning (moved to separate UI)
   - Hive-mind coordination
   - Extended GitHub swarm agents
   - Template generators
   - Migration summaries

## Adding Additional Agents

If you need specialized agents not included here, you can:

1. **Add custom agents** to this directory following the existing format
2. **Install agent plugins** via `npx ruflo@latest plugins install <plugin-name>`
3. **Request agents from the registry** (planned feature for future release)

For agents requiring external MCP servers (Flow Nexus, etc.), ensure the MCP server is installed and configured before using those agents.

---

**Before this cleanup:** 108 agents, 1.2MB (~300K tokens per conversation)  
**After cleanup:** 16 agents, 200KB (~50K tokens per conversation)  
**Token savings:** ~83% reduction in context bloat

See [Issue #1504](https://github.com/ruvnet/ruflo/issues/1504) for detailed rationale.
