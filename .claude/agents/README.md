# Ruflo Agent Definitions

This directory contains 91 agent definition files organized by category. These agents are automatically discovered by Claude Code and can be spawned using the Task tool.

## Agent Categories

### Core Development (5 agents)
**Location:** `core/`

These are the most commonly used agents for day-to-day development:
- `coder` - Implementation specialist for writing clean, efficient code
- `reviewer` - Code review and quality assurance specialist
- `tester` - Comprehensive testing and quality assurance specialist
- `planner` - Strategic planning and task orchestration agent
- `researcher` - Deep research and information gathering specialist

### GitHub Integration (13 agents)
**Location:** `github/`

Agents for GitHub workflow automation, PR management, issue tracking, and code review:
- `pr-manager` - Pull request lifecycle management
- `issue-tracker` - Issue triage and tracking
- `code-review-swarm` - Coordinated code review
- `workflow-automation` - GitHub Actions automation
- And more...

### Swarm Coordination (3 agents)
**Location:** `swarm/`

Multi-agent coordination and orchestration:
- `hierarchical-coordinator` - Queen-led hierarchical coordination
- `mesh-coordinator` - Peer-to-peer mesh network coordination
- `adaptive-coordinator` - Dynamic topology switching

### Architecture & Design (4 agents)
**Location:** `architecture/`, `sparc/`

System design and SPARC methodology:
- `arch-system-design` - System architecture specialist
- `sparc-coder` - SPARC methodology implementation
- `specification` - Requirements analysis
- `refinement` - Iterative improvement

### Security & Performance (7 agents)
**Location:** `v3/`, `consensus/`

V3 specialized agents and consensus protocols:
- `v3-security-architect` - Security architecture design
- `v3-performance-engineer` - Performance optimization
- `byzantine-coordinator` - Byzantine fault tolerance
- `raft-manager` - Raft consensus implementation
- And more...

### Testing & Validation (3 agents)
**Location:** `testing/`

Comprehensive testing strategies:
- `tdd-london-swarm` - TDD London School (mock-first)
- `production-validator` - Production readiness validation
- `test-long-runner` - Long-running test execution

### Specialized (21 agents)
**Location:** `analysis/`, `data/`, `development/`, `devops/`, `documentation/`, `specialized/`

Domain-specific agents:
- `analyze-code-quality` - Code quality analysis
- `data-ml-model` - Machine learning development
- `dev-backend-api` - Backend API development
- `ops-cicd-github` - CI/CD pipeline management
- `docs-api-openapi` - OpenAPI documentation
- `spec-mobile-react-native` - React Native mobile development
- And more...

## What Was Removed

**Version 3.6.12** removed 17 non-functional agent definitions (-15.7%, 2,539 lines) to reduce context bloat:

### Non-functional agents (missing MCP dependencies)
- **flow-nexus/** (9 agents, ~32KB) - Required `flow-nexus` MCP server (not included in standard install)
- **sublinear/** (5 agents, ~55KB) - Required `sublinear-time-solver` MCP server (does not exist)
- **payments/agentic-payments** (1 agent, ~5KB) - Required `agentic-payments` MCP server (not included)

### Duplicate files
- `analysis/analyze-code-quality.md` (kept nested version in `code-review/`)
- `development/dev-backend-api.md` (kept nested version in `backend/`)

These agents referenced MCP tools that are not available in a standard `npx ruflo@latest` installation, causing them to fail 100% of the time when spawned.

## Opt-in Installation (Future)

Future versions will support installing additional agent packs:

```bash
# Install optional agent packs when their MCP dependencies are configured
ruflo agents install flow-nexus      # if you have Flow Nexus MCP
ruflo agents install sublinear       # if you have sublinear-time-solver
ruflo agents install advanced-github # extended GitHub coordination
```

## Usage

Agents are spawned using Claude Code's Task tool:

```typescript
Task({
  description: "Review security vulnerabilities",
  prompt: "Perform a security audit of the authentication module",
  subagent_type: "v3-security-architect"
})
```

Or via the CLI:

```bash
npx ruflo agent spawn --type coder --name worker-1
```

## File Format

Each agent is defined in a Markdown file with YAML frontmatter:

```markdown
---
name: agent-name
description: Brief description
---

# Agent Name

Instructions and capabilities...
```

## See Also

- [Skills](.claude/skills/) - Reusable skill modules
- [User Guide](../../docs/USERGUIDE.md) - Complete documentation
- [Agent Coordination Skill](.agents/skills/agent-coordination/SKILL.md) - Agent usage patterns
