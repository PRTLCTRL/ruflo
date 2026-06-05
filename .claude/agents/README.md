# Ruflo Core Agents

This directory contains the **13 core agents** that ship with Ruflo. These agents are fully functional in a standard installation and don't require additional MCP servers.

## Why Only 13 Agents?

Previous versions shipped 108 agent definitions (~832KB), but most referenced non-existent MCP servers or were duplicates. This bloated every conversation's context window with ~300K tokens of unusable definitions.

**What we removed:**
- **flow-nexus** agents (9) - Required `flow-nexus` MCP server (not installed by default)
- **sublinear** agents (5) - Required `sublinear-time-solver` MCP server (not installed)
- **agentic-payments** agent (1) - Required `agentic-payments` MCP server (not installed)
- **Consensus** agents (7) - Generic implementations with no project-specific value
- **Optimization** agents (5) - Generic implementations with no project-specific value
- **Duplicates** (4) - Multiple copies of the same agent
- **Other non-essential agents** (64) - Niche specialists, templates, and v3-specific agents

**Size reduction:** 832KB → 108KB (87% smaller, saving ~724KB / ~180K tokens)

## Core Agents (5)

Essential agents for day-to-day development:

- **coder** - Code implementation and modification
- **planner** - Task planning and project organization
- **researcher** - Code analysis and investigation
- **reviewer** - Code review and quality checks
- **tester** - Test writing and validation

## GitHub Integration (3)

Agents for GitHub workflow automation:

- **pr-manager** - Pull request creation and management
- **issue-tracker** - Issue tracking and organization
- **code-review-swarm** - Coordinated code review with multiple agents

## Swarm Coordination (1)

Multi-agent orchestration:

- **hierarchical-coordinator** - Queen-led swarm coordination

## Specialized (4)

Advanced capabilities for specific use cases:

- **security-auditor** - Security scanning and vulnerability detection
- **v3-memory-specialist** - AgentDB memory management and optimization
- **implementer-sparc-coder** - SPARC methodology implementation
- **orchestrator-task** - Complex task orchestration

## Installing Additional Agents

Future versions will support opt-in agent installation for specific use cases:

```bash
# Example (not yet implemented)
ruflo agents install flow-nexus    # Flow Nexus platform integration
ruflo agents install sublinear     # Advanced optimization algorithms
ruflo agents install github-full   # Extended GitHub agents
```

## Performance Impact

By shipping only functional agents, we've reduced the token overhead per conversation from ~300K to ~27K tokens, saving roughly **$4+ per conversation** on Claude Opus 4.
