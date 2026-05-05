# PR: Reduce Agent Bloat from 108 to 15 Core Agents (86% Reduction)

## The Problem

Ruflo shipped **108 agent definition files** (1.19MB / ~300K tokens) in `.claude/agents/`. The majority of these agents reference MCP servers that don't exist in a standard installation, making them dead weight that inflates every conversation's context window.

When you try to use one of these agents, you get an error followed by a wall of **90+ agent names** dumped into the error message and system prompt. This list alone costs significant tokens on every single interaction.

## The Numbers (Before)

| Category | Files | Status |
|----------|-------|--------|
| `flow-nexus/` | 9 | **100% non-functional** — requires `flow-nexus` MCP (not installed) |
| `sublinear/` | 5 | **100% non-functional** — requires `sublinear-time-solver` MCP (not installed) |
| `payments/` | 1 | **100% non-functional** — requires `agentic-payments` MCP (not installed) |
| `consensus/` | 7 | References non-existent MCP servers |
| `optimization/` | 5 | Generic, no project-specific value |
| `v3/` | 16 | References internal v3 architecture |
| **Duplicates** | 10 | Same agent, different directories |
| **Total** | 108 files | **1.19MB (~300K tokens)** |

At ~$0.015/1K input tokens on Opus, that's roughly **$4.50 per conversation just for agent definitions** that are mostly non-functional.

## The Fix

Moved 93 agents to `.claude/agents-optional/` and kept only the **15 core functional agents** that work out-of-the-box.

### Core Agents (15 - 172KB / ~43K tokens)

**Development (6)**
- `coder` - Implementation specialist
- `tester` - Test creation and validation
- `reviewer` - Code quality review
- `planner` - Strategic planning
- `researcher` - Requirements analysis
- `code-analyzer` - Code quality analysis

**GitHub Integration (3)**
- `pr-manager` - Pull request management
- `issue-tracker` - Issue tracking
- `code-review-swarm` - Coordinated code review

**Swarm Coordination (3)**
- `hierarchical-coordinator` - Queen-led hierarchical swarms
- `mesh-coordinator` - Peer-to-peer mesh
- `adaptive-coordinator` - Dynamic topology

**Testing & Quality (2)**
- `tdd-london-swarm` - TDD coordination
- `production-validator` - Production readiness

**Security (1)**
- `security-auditor` - Security scanning

### Changes Made

1. ✅ Moved 93 agents to `.claude/agents-optional/`
2. ✅ Removed 10 duplicate agent files
3. ✅ Created README.md in both directories
4. ✅ Optional agents can be installed on-demand

### Installation of Optional Agents

```bash
# List available categories
ls .claude/agents-optional/

# Install a full category
cp -r .claude/agents-optional/github-extended .claude/agents/

# Install a single agent
cp .claude/agents-optional/v3-specialized/memory-specialist.md .claude/agents/
```

## Impact

- **Context overhead reduced by 86%** (300K → 43K tokens per conversation)
- **Error messages stay concise** (15 names instead of 90+)
- **Non-functional agents no longer confuse users**
- **Optional agents available on-demand**

## Testing

What I actually tested:

1. ✅ Verified file structure: 15 agents remain in `.claude/agents/`
2. ✅ Verified duplicates removed (10 files deleted)
3. ✅ Verified optional agents moved to `.claude/agents-optional/` (93 files)
4. ✅ Created comprehensive READMEs explaining the change
5. ✅ Checked total size reduction: 1.2MB → 172K (86% reduction)

What I couldn't test:
- Build/test suite (Node.js not available in this environment)
- Runtime agent loading behavior (would need full Ruflo installation)
- MCP tool references (would need MCP servers running)

## Validation Needed

I'm trying to get more involved with this project, so please point out if:
- Any core agent was incorrectly moved to optional
- The 15 core agents don't cover the most common workflows
- The README explanations are unclear
- Additional documentation needs updating

## References

Fixes ruvnet/ruflo#1504

---

## Instructions for Creating PR

Since I don't have collaborator access, please create the PR manually:

1. Go to: https://github.com/PRTLCTRL/ruflo/pull/new/cursor/fix-agent-bloat-issue-1504-cab3
2. Set base repository: ruvnet/ruflo (base: main)
3. Set compare: PRTLCTRL/ruflo (cursor/fix-agent-bloat-issue-1504-cab3)
4. Title: "fix: reduce agent bloat from 108 to 15 core agents (86% reduction)"
5. Copy this file's content as the PR description
6. Submit as ready for review (not draft)
