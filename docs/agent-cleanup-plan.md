# Agent Cleanup Plan - Issue #1504

## Problem
106 agent definition files ship by default (~300K tokens / 1.19MB), most referencing non-existent MCP servers, causing:
- Context bloat on every conversation
- ~$4.50 per conversation in wasted tokens (Opus pricing)
- Error messages listing 90+ unavailable agents
- Dead weight for standard installations

## Solution
Keep only ~15 core agents that work out-of-the-box. Remove/relocate non-functional agents.

## Agents to KEEP (Core - work without external MCPs)

### Core Development (5)
- `core/coder.md` ✓
- `core/tester.md` ✓  
- `core/reviewer.md` ✓
- `core/researcher.md` ✓
- `core/planner.md` ✓

### Swarm Coordination (3)
- `swarm/hierarchical-coordinator.md` ✓
- `swarm/mesh-coordinator.md` ✓
- `swarm/adaptive-coordinator.md` ✓

### SPARC Methodology (4)
- `sparc/specification.md` ✓
- `sparc/pseudocode.md` ✓
- `sparc/architecture.md` ✓
- `sparc/refinement.md` ✓

### GitHub (2-3, if they work without external MCP)
- `github/pr-manager.md` ✓ (check if it works standalone)
- `github/issue-tracker.md` ✓ (check if it works standalone)

### Templates (1-2)
- `templates/base-template-generator.md` ✓

**Total: ~15-17 core agents**

## Agents to REMOVE (Non-Functional)

### Sublinear (5 files) - 100% non-functional
**Reason**: Requires `mcp__sublinear-time-solver__*` which doesn't ship
- `sublinear/consensus-coordinator.md` ❌
- `sublinear/matrix-optimizer.md` ❌
- `sublinear/pagerank-analyzer.md` ❌
- `sublinear/performance-optimizer.md` ❌
- `sublinear/trading-predictor.md` ❌

### Payments (1 file) - 100% non-functional  
**Reason**: Requires `mcp__agentic-payments__*` which doesn't ship
- `payments/agentic-payments.md` ❌

### Duplicates (7 files)
- `specialized/spec-mobile-react-native.md` ❌ (keep the one in mobile/ subdirectory)
- `devops/ops-cicd-github.md` ❌ (keep the one in ci-cd/ subdirectory)
- `development/dev-backend-api.md` ❌ (keep the one in backend/ subdirectory)
- `data/data-ml-model.md` ❌ (keep the one in ml/ subdirectory)
- And check for more duplicates...

### Optional/Advanced (move to docs or examples)
These could be kept in a separate directory for opt-in installation:
- V3 specialized agents (16 files in v3/)
- GitHub advanced (release-swarm, multi-repo-swarm, code-review-swarm, etc.)
- Optimization suite (5 files in optimization/)
- Templates (coordinator-swarm-init, orchestrator-task, etc.)

## Implementation Steps

1. ✅ Create this plan document
2. ⬜ Delete non-functional agents (sublinear/, payments/)
3. ⬜ Remove duplicate files
4. ⬜ Move optional agents to `docs/agents-optional/` or similar
5. ⬜ Update any code that references removed agents
6. ⬜ Test build
7. ⬜ Create PR with clear before/after metrics

## Expected Impact

### Before
- 98+ agent files
- ~1.19MB / ~300K tokens
- $4.50 per conversation in context bloat (Opus)

### After  
- ~15-17 agent files
- ~200-250KB / ~50-65K tokens
- ~$0.75-1.00 per conversation
- **~80% reduction in agent bloat**

## Migration Path for Users

Users who need the removed agents can:
1. Install specific agent collections via CLI:
   ```bash
   ruflo agents install sublinear    # If they have sublinear-time-solver MCP
   ruflo agents install github-full  # Extended GitHub agents
   ```

2. Or manually copy from `docs/agents-optional/` directory

## Testing

- ✅ Verify core agents load correctly
- ✅ Run `npm run build` 
- ✅ Check agent-loader.ts still works
- ✅ Verify no broken imports/references
