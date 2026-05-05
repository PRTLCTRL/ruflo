# Ruflo Core Agents

This directory contains the **15 core functional agents** that ship with Ruflo by default. These agents work out-of-the-box without additional MCP servers or configuration.

## Core Agents (15 total)

### Development (6 agents)
- **coder** - Implementation specialist for writing clean code
- **tester** - Test creation and validation
- **reviewer** - Code quality and security review
- **planner** - Strategic planning and task breakdown
- **researcher** - Requirements analysis and research
- **code-analyzer** - Advanced code quality analysis

### GitHub Integration (3 agents)
- **pr-manager** - Pull request management
- **issue-tracker** - Issue tracking and management
- **code-review-swarm** - Coordinated code review

### Swarm Coordination (3 agents)
- **hierarchical-coordinator** - Queen-led hierarchical swarms (recommended)
- **mesh-coordinator** - Peer-to-peer mesh coordination
- **adaptive-coordinator** - Dynamic topology switching

### Testing & Quality (2 agents)
- **tdd-london-swarm** - TDD London School (mock-first) coordination
- **production-validator** - Production readiness validation

### Security (1 agent)
- **security-auditor** - Security scanning and CVE detection

## Optional Agents (93 agents)

Additional specialized agents are available in `.claude/agents-optional/` but are **not loaded by default** to minimize context bloat. Many require external MCP servers that don't ship with Ruflo.

### Installing Optional Agents

```bash
# List available optional agent categories
ls .claude/agents-optional/

# Install a specific category (copy back to main agents directory)
cp -r .claude/agents-optional/github-extended .claude/agents/

# Install a single agent
cp .claude/agents-optional/v3-specialized/memory-specialist.md .claude/agents/
```

### Optional Agent Categories

| Category | Count | Status | Notes |
|----------|-------|--------|-------|
| `flow-nexus/` | 9 | ❌ Non-functional | Requires `flow-nexus` MCP server (not installed) |
| `sublinear/` | 5 | ❌ Non-functional | Requires `sublinear-time-solver` MCP (not installed) |
| `payments/` | 1 | ❌ Non-functional | Requires `agentic-payments` MCP (not installed) |
| `consensus/` | 7 | ⚠️ Partial | Requires ruflo MCP for full functionality |
| `optimization/` | 5 | ⚠️ Generic | Generic optimization agents, limited value |
| `github-extended/` | 10 | ✅ Functional | Extended GitHub operations beyond core 3 |
| `v3-specialized/` | 16 | ⚠️ Partial | V3 internal architecture agents |
| `sparc/` | 4 | ✅ Functional | SPARC methodology (niche but works) |
| `hive-mind/` | 5 | ⚠️ Partial | Advanced swarm coordination |
| `neural/` | 1 | ⚠️ Partial | SONA neural optimization |
| `templates/` | 9 | ✅ Functional | Template agents |
| `language-specialists/` | 2 | ✅ Functional | Python/TypeScript specialists |
| `development/` | 1 | ✅ Functional | Backend API specialist |
| `analysis/` | 1 | ✅ Functional | Additional code analysis |
| Others | ~17 | Mixed | Architecture, docs, devops, etc. |

## Why Only 15 Core Agents?

Before this fix, Ruflo shipped **108 agent definitions (1.2MB / ~300K tokens)**. This had several problems:

1. **Most agents don't work** - 15+ agents reference MCP servers that don't exist in standard installs
2. **Context bloat** - Every conversation pays the token cost of all agent definitions
3. **Confusing errors** - Agent errors dump all 90+ names into the message
4. **Duplicates** - 10 agents existed twice in different directories

By shipping only the core 15 agents (172K / ~43K tokens), we:
- ✅ Reduce context overhead by **86%**
- ✅ Eliminate broken agent references
- ✅ Keep error messages concise
- ✅ Allow opt-in for specialized needs

## Usage

The core 15 agents cover 95% of development workflows:

```javascript
// Standard development workflow
Task({ subagent_type: "researcher", prompt: "Analyze requirements" })
Task({ subagent_type: "planner", prompt: "Break down implementation" })
Task({ subagent_type: "coder", prompt: "Implement feature" })
Task({ subagent_type: "tester", prompt: "Write tests" })
Task({ subagent_type: "reviewer", prompt: "Review code quality" })

// GitHub workflow
Task({ subagent_type: "pr-manager", prompt: "Create PR" })

// Swarm coordination
Task({ subagent_type: "hierarchical-coordinator", prompt: "Coordinate 8-agent swarm" })
```

## Adding Custom Agents

Create new agents in `.claude/agents/custom/`:

```bash
mkdir -p .claude/agents/custom
cat > .claude/agents/custom/my-agent.md << 'EOF'
---
name: my-custom-agent
description: Custom agent for specific needs
---

Agent prompt and instructions here...
EOF
```

## Feedback

If you need an optional agent regularly, please open an issue suggesting it be promoted to core:
https://github.com/ruvnet/ruflo/issues
