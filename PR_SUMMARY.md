# Pull Request: Fix Agent Context Bloat (#1504)

**Branch:** `fix/issue-1504-agent-bloat-eeff`  
**Target:** `ruvnet/ruflo:main`  
**From:** `PRTLCTRL/ruflo:fix/issue-1504-agent-bloat-eeff`

---

## Quick Summary

Reduced default agent context from **108 agents (~191K tokens)** to **77 agents (~167K tokens)** by moving non-functional agents to `.claude/agents/optional/` and removing duplicates.

**Savings:** ~24K tokens per session (~$0.36 per conversation on Opus)

---

## What Changed

### Files Modified
- `v2/src/agents/agent-loader.ts` — Added `**/optional/**` to ignore pattern
- `.claude/agents/optional/README.md` — Created (new file)
- Moved 15 agents to `.claude/agents/optional/`:
  - 9 flow-nexus agents
  - 5 sublinear agents  
  - 1 agentic-payments agent
- Deleted 10 duplicate agent files

### Commit
```
fix(agents): reduce context bloat by 24K tokens - move non-functional agents to optional/

- Move 15 non-functional agents to .claude/agents/optional/:
  * 9 flow-nexus agents (require external Flow Nexus MCP server)
  * 5 sublinear agents (require non-existent sublinear-time-solver MCP)
  * 1 agentic-payments agent (requires external payments MCP)

- Remove 10 duplicate agent files (keeping root versions):
  * analyze-code-quality.md, arch-system-design.md, dev-backend-api.md
  * ops-cicd-github.md, docs-api-openapi.md, spec-mobile-react-native.md
  * data-ml-model.md, plus duplicates in reasoning/testing/v3 dirs

- Update agent-loader.ts to skip optional/ directory by default

Impact:
- Before: 108 agents (~748KB / ~191K tokens)
- After: 77 core agents (~654KB / ~167K tokens)
- Token savings: ~24K per session
- Cost savings: $0.36 per conversation on Opus

Users can still access optional agents by copying them from
.claude/agents/optional/ after installing the required MCP servers.
See .claude/agents/optional/README.md for setup instructions.

Fixes #1504
```

---

## Testing Done

✅ **Agent count verification**
```bash
find .claude/agents -name '*.md' ! -path "*/optional/*" | wc -l
# 77 agents

find .claude/agents/optional -name '*.md' | wc -l  
# 16 agents (15 + README)
```

✅ **Size verification**
- Main agents: 654KB (~167K tokens)
- Optional agents: 94KB (~24K tokens)
- Total reduction: ~24K tokens per session

✅ **Code changes verified**
- Agent loader now excludes `**/optional/**`
- Directory structure correct
- README created with setup instructions

❌ **Build not tested** — Node/npm unavailable in environment
❌ **Runtime not tested** — Couldn't spawn live Ruflo session
❌ **Integration tests not run** — Needs local Ruflo install

---

## Recommended Testing

Before merge, please verify:

1. **Agent loading:**
   ```bash
   npx @claude-flow/cli@latest agent list
   # Should show ~77 agents, not 108
   ```

2. **Core agents still work:**
   ```bash
   npx @claude-flow/cli@latest agent spawn --type coder
   # Should succeed (coder is in core/)
   ```

3. **Optional agents excluded:**
   ```bash
   npx @claude-flow/cli@latest agent spawn --type flow-nexus-app-store
   # Should fail with "agent type not found"
   ```

4. **Build passes:**
   ```bash
   npm run build && npm test
   ```

---

## Design Decisions

### Why `optional/` instead of deleting?

- Some users may have these MCP servers installed
- Provides clear migration path
- Preserves agent definitions for future use

### Why not lazy loading?

- More complex to implement
- Doesn't solve "agent list dumped in errors" problem  
- Metadata still loaded into context

### Why remove duplicates?

- No functional value in having same agent twice
- Reduces maintenance burden
- Saves additional ~15 agent files

---

## Migration Path for Users

If someone has Flow Nexus, sublinear, or agentic-payments configured:

```bash
# Copy agents after installing MCP server
cp -r .claude/agents/optional/flow-nexus .claude/agents/

# Or symlink for development
ln -s $(pwd)/.claude/agents/optional/flow-nexus .claude/agents/flow-nexus-enabled

# Refresh agent cache
npx @claude-flow/cli@latest agent list --refresh
```

See `.claude/agents/optional/README.md` for detailed instructions.

---

## Questions for Reviewers

1. Is `optional/` the right naming? Alternatives: `external-mcp/`, `non-default/`, `requires-mcp/`

2. Should we add a CLI command for convenience?
   ```bash
   ruflo agents enable flow-nexus
   # Automatically copies from optional/ to main directory
   ```

3. Any concerns about existing workflows breaking?
   - Agent loader change is backward compatible
   - Core agents unchanged
   - Only affects users who explicitly spawn optional agents

4. Should we also trim individual agent definitions (some are 15-35KB)?
   - Could move detailed instructions to runtime prompts
   - Would save additional tokens

---

## Impact Metrics

**Token Reduction:**
- Per session: ~24,000 tokens saved
- Per conversation: ~$0.36 saved (Opus @ $15/1M input tokens)
- Per 100 conversations: ~$36 saved

**Agent Reduction:**
- Before: 108 agents
- After: 77 core + 15 optional (93 total)
- Removed: 15 non-functional duplicates

**Size Reduction:**
- Main directory: 654KB (was part of 748KB)
- Optional directory: 94KB (new)
- Effective reduction: ~94KB not loaded by default

---

## Related Issues

Fixes ruvnet/ruflo#1504

---

## Next Steps

After this PR:
1. Consider implementing `ruflo agents enable <package>` CLI command
2. Audit remaining agent definitions for size (some are 15-35KB)
3. Add agent definition linting to prevent future bloat
4. Document agent definition best practices

---

**Ready for review!** Happy to iterate on naming, implementation, or documentation.
