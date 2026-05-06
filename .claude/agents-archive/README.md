# Archived Agent Definitions

**Date:** 2026-05-06  
**Issue:** [#1504](https://github.com/ruvnet/ruflo/issues/1504) - Agent definition bloat

## Why These Were Archived

106 agent definitions (1.2MB / ~300K tokens) were shipping with Ruflo by default. The majority referenced MCP servers that don't exist in a standard installation, making them non-functional and adding significant context bloat to every Claude Code session.

## What's Archived Here

### Non-Functional Agents (Missing MCP Dependencies)

| Category | Count | Missing MCP Server | Status |
|----------|-------|-------------------|--------|
| `flow-nexus/` | 9 | `flow-nexus` | Requires Flow Nexus SaaS platform |
| `sublinear/` | 5 | `sublinear-time-solver` | Doesn't exist in standard install |
| `payments/` | 1 | `agentic-payments` | Not installed by default |

**Total non-functional:** 15+ agents

### Duplicate Agents (Nested Directories)

These agents existed twice - once at category root and once in a subdirectory:

- `analyze-code-quality.md` (analysis/ and analysis/code-review/)
- `arch-system-design.md` (architecture/ and architecture/system-design/)
- `dev-backend-api.md` (development/ and development/backend/)
- `ops-cicd-github.md` (devops/ and devops/ci-cd/)
- `docs-api-openapi.md` (documentation/ and documentation/api-docs/)
- `spec-mobile-react-native.md` (specialized/ and specialized/mobile/)
- `data-ml-model.md` (data/ and data/ml/)

### Niche/Verbose Agents

The remaining ~80 agents were either:
- Marketing copy posing as agents (e.g., `trading-predictor` claiming "temporal advantage")
- Verbose prompt wrappers that add no value over the core `coder`/`planner` agents
- Specialized for workflows most users will never need

## What's Still Active

**13 core functional agents** remain in `.claude/agents/`:

### Core Development (5)
- `core/coder.md` - Implementation specialist
- `core/planner.md` - Strategic planning
- `core/researcher.md` - Research and analysis
- `core/reviewer.md` - Code review
- `core/tester.md` - Testing specialist

### GitHub Integration (3)
- `github/pr-manager.md` - Pull request management
- `github/issue-tracker.md` - Issue tracking
- `github/code-review-swarm.md` - Coordinated code review

### V3 Specialists (3)
- `v3/v3-security-architect.md` - Security architecture
- `v3/v3-memory-specialist.md` - AgentDB memory optimization
- `v3/v3-performance-engineer.md` - Performance optimization

### Coordination (2)
- `swarm/hierarchical-coordinator.md` - Multi-agent coordination
- `base-template-generator.md` - Template scaffolding
- `sparc/sparc-coder.md` - SPARC methodology implementation

## How to Restore Agents (If Needed)

If you need agents from this archive:

### Option 1: Copy Specific Agents Back

```bash
# Copy a specific agent back to active directory
cp .claude/agents-archive/flow-nexus/app-store.md .claude/agents/flow-nexus/

# Or copy an entire category
cp -r .claude/agents-archive/flow-nexus .claude/agents/
```

### Option 2: Install via Plugin System (Planned)

**Coming in future release:** Opt-in agent registry

```bash
# Install Flow Nexus agents (if you have Flow Nexus configured)
ruflo agents install flow-nexus

# Install sublinear agents (if you have sublinear-time-solver MCP)
ruflo agents install sublinear

# Install extended GitHub agent set
ruflo agents install github-full
```

### Option 3: Restore Everything (Not Recommended)

```bash
# This will restore all 106 agents (not recommended - brings back the bloat)
cp -r .claude/agents-archive/* .claude/agents/
```

## Impact of This Change

**Before:**
- 106 agent definitions
- 1.2MB / ~300K tokens
- ~$4.50 per conversation in Opus input tokens
- Most agents non-functional due to missing MCP servers

**After:**
- 13 core functional agents
- 148KB / ~40K tokens  
- ~87% token reduction
- All agents work out of the box

## Future Plans

See issue [#1504](https://github.com/ruvnet/ruflo/issues/1504) for discussion of:
- Lazy-loading agents (only load when spawned)
- Opt-in agent registry
- Removing agent list from error messages
- Trimming agent definitions to <2KB each
