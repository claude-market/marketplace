---
description: "Cancel active winning orchestration — salvages partial results, preserves history"
argument-hint: "[--force]"
---

# Cancel Winning Orchestration

## Step 1 -- Salvage

BEFORE cancelling, read both files if they exist:

1. `.claude/winning-orchestrator.local.md` — extract goal, round number
2. `.claude/winning-history.local.md` — extract all round results and learnings

Check conversation for completed background agents. For each, note: STRATEGY RESULT status, PROGRESS_REPORT, and FILES_CHANGED list.

## Step 2 -- Cancel

```!
"${CLAUDE_PLUGIN_ROOT}/scripts/cancel-loop.sh" $ARGUMENTS
```

## Step 3 -- Report

1. **Cancellation confirmed**: rounds completed, elapsed time
2. **Salvaged results** (from completed or in-progress agents):
   - Best-performing agent and its progress_score
   - Files changed by completed agents
   - Non-overlapping files that may be directly usable
3. **Recommendation** (exactly one):

   | Condition | Recommendation |
   |-----------|---------------|
   | Any agent COMPLETED (verification passed) | "[X] achieved the goal. Consolidate its output." |
   | Any agent progress_score >= 70 | "[X] was near completion. Its output in [files] may be directly usable." |
   | Any agent progress_score 30-69 | "[X] made partial progress. Review [files] for reusable work." |
   | No agent exceeded progress_score 30 | "No significant progress. Consider a different approach." |
   | Cancelled during round 1 (no history) | "Cancelled before any rounds completed. No results to salvage." |

4. **History preserved**: `.claude/winning-history.local.md` is NOT deleted — learnings persist. To resume later, the history provides context for a fresh `/winning:launch`.
5. **Cleanup note**: Background agents may still be running. If using worktrees, run `git worktree list` to identify and `git worktree prune` to clean up.
