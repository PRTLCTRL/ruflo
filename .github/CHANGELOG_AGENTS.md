# Agent Definitions Cleanup - June 2026

## Overview

Removed 24 non-functional and duplicate agent definition files that were inflating context windows with ~149KB of unusable definitions.

## Impact Summary

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Total Agents** | 108 | 84 | -24 (22%) |
| **Total Size** | 807KB | 658KB | -149KB (18%) |
| **Non-functional** | 17 | 0 | -17 |
| **Duplicates** | 7 | 0 | -7 |

## What Was Removed

### Non-Functional Agents (17 files)

These agents reference MCP servers not included in standard Ruflo installations:

1. **Flow Nexus** (9 agents) - Require external `flow-nexus` MCP server (SaaS platform)
2. **Sublinear Solver** (5 agents) - Require non-existent `sublinear-time-solver` MCP server  
3. **Goal Planning** (2 agents) - Require both flow-nexus and sublinear MCP servers
4. **Payments** (1 agent) - Requires `agentic-payments` MCP server

### Duplicate Files (7 files)

Nested duplicates removed (root-level versions kept for discoverability):
- `analysis/code-review/analyze-code-quality.md`
- `architecture/system-design/arch-system-design.md`  
- `data/ml/data-ml-model.md`
- `development/backend/dev-backend-api.md`
- `devops/ci-cd/ops-cicd-github.md`
- `documentation/api-docs/docs-api-openapi.md`
- `specialized/mobile/spec-mobile-react-native.md`

## Remaining Agent Distribution

| Category | Count | Status |
|----------|-------|--------|
| **Core** | 5 | ✅ Fully functional |
| **GitHub** | 13 | ✅ Fully functional |
| **V3 Specialized** | 10 | ✅ Fully functional |
| **Templates** | 9 | ✅ Fully functional |
| **Consensus** | 7 | ✅ Fully functional |
| **Swarm** | 3 | ✅ Fully functional |
| **Hive Mind** | 5 | ✅ Fully functional |
| **Optimization** | 5 | ✅ Fully functional |
| **SPARC** | 4 | ✅ Fully functional |
| **Testing** | 4 | ✅ Fully functional |
| **Others** | 19 | ✅ Functional/Template |

**Total:** 84 functional agents

## Token Cost Impact

### Before
- ~300K tokens per conversation from agent definitions
- At $0.015/1K tokens (Opus): **$4.50 per conversation**
- 20 conversations/day: **~$90/day in agent bloat**

### After  
- ~240K tokens per conversation (20% reduction)
- At $0.015/1K tokens (Opus): **$3.60 per conversation**
- 20 conversations/day: **~$72/day** (**$18/day saved**)

## Backward Compatibility

All removed agents can be reinstalled via the plugin system (when available):

```bash
# If you need these agents:
ruflo agents install flow-nexus      # Flow Nexus agents
ruflo agents install sublinear       # Sublinear solver agents  
ruflo agents install agentic-payments # Payments agent
```

## Related Issues

- Fixes #1504 - [Bug] 106 agent definitions ship by default — ~300K tokens of context bloat

## Migration Notes

If your workflows reference any removed agents, they will fail with "Agent type not found" errors. Update your workflows to use core agents or install the required external MCP servers.

For detailed documentation on removed agents, see `.claude/agents/REMOVED_AGENTS.md`.
