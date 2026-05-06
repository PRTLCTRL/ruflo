# Agent Directory Migration - May 2026

## What Changed

As of this release, Ruflo ships with **13 core functional agents** instead of 106. This reduces context bloat by **87%** (from 1.2MB to 148KB).

## Why

The previous 106 agents included:
- **15+ agents** that reference MCP servers not installed by default (flow-nexus, sublinear-time-solver, agentic-payments)
- **7 duplicate agents** in nested directories
- **~80 verbose/niche agents** that were marketing copy or provided no value over core agents

This was costing ~**$4.50 per conversation** in Opus input tokens alone.

## What's Active Now

**13 core functional agents** in `.claude/agents/`:

### Core Development (5)
- `core/coder` - Implementation specialist
- `core/planner` - Strategic planning  
- `core/researcher` - Research and analysis
- `core/reviewer` - Code review
- `core/tester` - Testing specialist

### GitHub Integration (3)
- `github/pr-manager` - Pull request management
- `github/issue-tracker` - Issue tracking
- `github/code-review-swarm` - Coordinated code review

### V3 Specialists (3)
- `v3/v3-security-architect` - Security architecture
- `v3/v3-memory-specialist` - AgentDB memory optimization
- `v3/v3-performance-engineer` - Performance optimization

### Coordination (2)
- `swarm/hierarchical-coordinator` - Multi-agent coordination
- `base-template-generator` - Template scaffolding
- `sparc/sparc-coder` - SPARC methodology implementation

## Where Did Everything Go?

All 95 archived agents are in **`.claude/agents-archive/`** with a full README explaining:
- Why each category was archived
- How to restore specific agents if needed
- Future plans for opt-in agent registry

See `.claude/agents-archive/README.md` for details.

## Impact

| Before | After | Change |
|--------|-------|--------|
| 106 agents | 13 agents | -87% count |
| 1.2MB | 148KB | -87% size |
| ~300K tokens | ~40K tokens | -87% tokens |
| ~$4.50/conversation | ~$0.60/conversation | -87% cost |

## Future Plans

See [issue #1504](https://github.com/ruvnet/ruflo/issues/1504) for discussion of:
- Opt-in agent registry (`ruflo agents install flow-nexus`)
- Lazy-loading (only load agents when spawned)
- Trimming definitions to <2KB each
- Removing agent list from error messages
