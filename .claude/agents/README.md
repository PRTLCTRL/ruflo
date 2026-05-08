# Ruflo Agent Definitions

## What Ships by Default

As of v3.6.13, Ruflo ships only the **core functional agents** that work out-of-the-box without additional MCP server dependencies. This reduces the default context bloat from ~300K tokens (106 agents) to ~30K tokens (~12 agents).

### Core Agents (Shipped)

These agents are included in `npx ruflo@latest` installations and require no additional setup:

| Agent | Purpose | Location |
|-------|---------|----------|
| `coder` | Implementation specialist for writing clean code | `.claude/agents/core/coder.md` |
| `reviewer` | Code review and quality assurance | `.claude/agents/core/reviewer.md` |
| `tester` | Test creation and validation | `.claude/agents/core/tester.md` |
| `planner` | Strategic planning and task orchestration | `.claude/agents/core/planner.md` |
| `researcher` | Deep research and information gathering | `.claude/agents/core/researcher.md` |
| `pr-manager` | GitHub PR creation and management | `.claude/agents/github/pr-manager.md` |
| `issue-tracker` | GitHub issue tracking and management | `.claude/agents/github/issue-tracker.md` |
| `code-review-swarm` | Coordinated code review workflows | `.claude/agents/github/code-review-swarm.md` |
| `hierarchical-coordinator` | Queen-led hierarchical swarm coordination | `.claude/agents/swarm/hierarchical-coordinator.md` |
| `security-auditor` | Security scanning and vulnerability detection | `.claude/agents/security-auditor.md` |

## Optional Agents (Available in Repo)

The following agent categories are available in this repository but **not shipped** in npm packages. They're preserved for:
- Development and testing
- Users who clone the repo
- Future opt-in registry features

### Non-Functional (Missing MCP Dependencies)

These agents reference MCP servers that don't ship with Ruflo:

| Category | Count | Dependency | Files |
|----------|-------|------------|-------|
| **flow-nexus** | 9 | `flow-nexus` MCP server | `flow-nexus/*` |
| **sublinear** | 5 | `sublinear-time-solver` MCP server | `sublinear/*` |
| **payments** | 1 | `agentic-payments` MCP server | `payments/agentic-payments.md` |

**Total: 15 agents** (~90KB) that will always fail without external MCP servers.

### Specialized (Niche Use Cases)

Functional but specialized agents for specific workflows:

| Category | Count | Use Case | Files |
|----------|-------|----------|-------|
| **consensus** | 7 | Byzantine fault tolerance, Raft, CRDT, Gossip | `consensus/*` |
| **optimization** | 5 | Performance monitoring, topology optimization | `optimization/*` |
| **hive-mind** | 5 | Queen-led collective intelligence | `hive-mind/*` |
| **sparc** | 4 | SPARC methodology (Specification, Pseudocode, Architecture, Refinement) | `sparc/*` |
| **v3** | 10 | V3-specific architecture features | `v3/*` |
| **templates** | 9 | Agent templates for custom agents | `templates/*` |
| **dual-mode** | 3 | Claude Code + Codex collaboration | `dual-mode/*` |
| **neural** | 1 | SAFLA neural learning | `neural/*` |
| **sona** | 1 | SONA self-learning optimizer | `sona/*` |

**Total: ~45 agents** (~200KB) for specialized workflows.

### GitHub Extended

Additional GitHub agents beyond the core `pr-manager` and `issue-tracker`:

| Agent | Purpose |
|-------|---------|
| `github-modes` | GitHub workflow modes |
| `project-board-sync` | Project board automation |
| `multi-repo-swarm` | Cross-repo coordination |
| `release-manager` | Release automation |
| `release-swarm` | Coordinated release workflows |
| `repo-architect` | Repository architecture |
| `swarm-issue` | Swarm-based issue handling |
| `swarm-pr` | Swarm-based PR workflows |
| `sync-coordinator` | Sync coordination |
| `workflow-automation` | GitHub Actions automation |

**Total: 10 agents** (~90KB)

### Duplicates & Misc

| Category | Description |
|----------|-------------|
| **Duplicate definitions** | 7 agent files that exist in both category root and nested subdirectory |
| **Language specialists** | `typescript-specialist`, `python-specialist`, `database-specialist` |
| **Other** | `base-template-generator`, `project-coordinator`, `MIGRATION_SUMMARY` |

## Why This Change?

### The Problem

Shipping 106 agent definitions (~1.19MB, ~300K tokens) caused:

1. **Token bloat**: Every conversation paid ~$4.50 in wasted input tokens on Opus for unused agent definitions
2. **Non-functional agents**: 15+ agents referenced MCP servers that don't exist in standard installations
3. **Error message pollution**: Agent listings dumped 90+ names into every error and system prompt
4. **Duplicate waste**: 7 agents existed twice in the tree

### The Solution

**Ship only what works.** Keep the rest in the repo for users who need them, but don't force everyone to pay the token tax.

## How to Use Optional Agents

### Option 1: Clone the Repo

```bash
git clone https://github.com/ruvnet/ruflo.git
cd ruflo
# All agents are available in .claude/agents/
```

### Option 2: Copy Individual Agents

```bash
# Download a specific agent from GitHub
curl -O https://raw.githubusercontent.com/ruvnet/ruflo/main/.claude/agents/consensus/raft-manager.md
# Place it in your project's .claude/agents/ directory
```

### Option 3: Wait for Agent Registry (Coming Soon)

```bash
# Future opt-in installation
ruflo agents install consensus     # Install consensus agents
ruflo agents install flow-nexus    # Install Flow Nexus agents (requires MCP server)
ruflo agents list --available      # Browse registry
```

## Impact

| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| **Agents shipped** | 106 | ~12 | 89% reduction |
| **Size** | 1.19MB | ~120KB | 90% reduction |
| **Estimated tokens** | ~300K | ~30K | 90% reduction |
| **Context cost** (Opus @ $0.015/1K tokens) | ~$4.50/conv | ~$0.45/conv | 90% reduction |

Over 20 conversations per day, this saves roughly **$81/day in wasted input tokens**.

## References

- Issue: [ruvnet/ruflo#1504](https://github.com/ruvnet/ruflo/issues/1504)
- PR: [ruvnet/ruflo#????](https://github.com/ruvnet/ruflo/pull/????) _(update after PR is created)_
- Commit: [??????](https://github.com/ruvnet/ruflo/commit/??????) _(update after commit)_
