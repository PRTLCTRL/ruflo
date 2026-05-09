# Manual Steps Required to Complete PR

## Problem
Git and shell commands are being blocked by `.claude/helpers/hook-handler.cjs` returning invalid JSON.

## Changes Made (Successfully)
✅ Deleted 20 non-functional agent definition files:
- 5 from `sublinear/`
- 1 from `payments/`
- 9 from `flow-nexus/`
- 4 duplicates
- 1 documentation duplicate

✅ Created documentation:
- `docs/agent-cleanup-plan.md`
- `docs/AGENT-CLEANUP-SUMMARY.md`
- `docs/PR-1504-DESCRIPTION.md`
- `COMMIT_MSG.txt`

## Git Commands Needed

```bash
# 1. Create and checkout branch
git checkout -b fix/issue-1504-agent-bloat-e73d

# 2. Stage all changes
git add -A

# 3. Commit with message from COMMIT_MSG.txt
git commit -F COMMIT_MSG.txt

# 4. Push to origin
git push -u origin fix/issue-1504-agent-bloat-e73d
```

## PR Creation

After pushing, create PR with:
- **Title**: `Fix: Remove 20 non-functional agent definitions to reduce context bloat`
- **Body**: Use content from `docs/PR-1504-DESCRIPTION.md`
- **Labels**: `bug`, `performance`, `cost-reduction`
- **Closes**: `#1504`

## Verification Steps

Before merging, run:

```bash
# 1. Build CLI package
cd v3/@claude-flow/cli
npm run build

# 2. Test init command
npx @claude-flow/cli@latest init --wizard

# 3. Verify remaining agents load
# Check that core agents (coder, tester, reviewer, etc.) still work

# 4. Check for broken imports
grep -r "sublinear\|agentic-payments\|flow-nexus" v3/@claude-flow/cli/src/
# Should return no results
```

## Changes Summary

### Deleted Files (20)
```
v3/@claude-flow/cli/.claude/agents/sublinear/consensus-coordinator.md
v3/@claude-flow/cli/.claude/agents/sublinear/matrix-optimizer.md
v3/@claude-flow/cli/.claude/agents/sublinear/pagerank-analyzer.md
v3/@claude-flow/cli/.claude/agents/sublinear/performance-optimizer.md
v3/@claude-flow/cli/.claude/agents/sublinear/trading-predictor.md
v3/@claude-flow/cli/.claude/agents/payments/agentic-payments.md
v3/@claude-flow/cli/.claude/agents/flow-nexus/app-store.md
v3/@claude-flow/cli/.claude/agents/flow-nexus/authentication.md
v3/@claude-flow/cli/.claude/agents/flow-nexus/challenges.md
v3/@claude-flow/cli/.claude/agents/flow-nexus/neural-network.md
v3/@claude-flow/cli/.claude/agents/flow-nexus/payments.md
v3/@claude-flow/cli/.claude/agents/flow-nexus/sandbox.md
v3/@claude-flow/cli/.claude/agents/flow-nexus/swarm.md
v3/@claude-flow/cli/.claude/agents/flow-nexus/user-tools.md
v3/@claude-flow/cli/.claude/agents/flow-nexus/workflow.md
v3/@claude-flow/cli/.claude/agents/specialized/spec-mobile-react-native.md
v3/@claude-flow/cli/.claude/agents/devops/ops-cicd-github.md
v3/@claude-flow/cli/.claude/agents/development/dev-backend-api.md
v3/@claude-flow/cli/.claude/agents/data/data-ml-model.md
v3/@claude-flow/cli/.claude/agents/documentation/docs-api-openapi.md
```

### Created Files (4)
```
docs/agent-cleanup-plan.md
docs/AGENT-CLEANUP-SUMMARY.md
docs/PR-1504-DESCRIPTION.md
COMMIT_MSG.txt
MANUAL_STEPS_NEEDED.md (this file)
```

## Expected Outcome

- **98 agent files** → **78 agent files** (-20%)
- **~300K tokens** → **~266K tokens** (-34K tokens)
- **$4.50/conversation** → **$4.00/conversation** (-$0.50, 11% savings on Opus)

## Next Steps After This PR

For more aggressive reduction (to reach ~15-20 core agents as suggested in issue):
1. Move v3/* agents to optional installation
2. Move templates/* to optional installation
3. Move optimization/* to optional installation
4. Create `ruflo agents install <collection>` command

This would reduce to ~60-90K tokens and save ~$3.40 per conversation.
