---
description: "Show current winning orchestration progress — round, agents, learnings"
---

# Winning Status

Run the status script:

```!
"${CLAUDE_PLUGIN_ROOT}/scripts/status.sh"
```

If no state file exists, report "No active winning orchestration." and stop.

## Gather State

Read both files:
1. `.claude/winning-orchestrator.local.md` — current round, goal, session info
2. `.claude/winning-history.local.md` — results and learnings from completed rounds (if exists)

## Report

Present to the user:
- **Goal**: what we're trying to achieve
- **Current round**: N (with elapsed time)
- **Agents this round**: how many deployed, how many completed, how many still running
- **Verification status**: has VERIFICATION_COMMAND passed for any agent?

If history file exists and has completed rounds:
- **Rounds completed**: N
- **Best result so far**: which agent/round got closest to passing verification
- **Key learnings**: the KEY INSIGHT and APPROACHES TO AVOID from the most recent round
- **Evolution**: one-line summary of how strategies evolved across rounds

## Advice

Provide exactly one recommendation:

| Condition | Recommendation |
|-----------|---------------|
| All agents still running | "Waiting for agents to complete." |
| Some agents done, none passed verification | "Round incomplete — waiting for remaining agents." |
| All agents done, none passed verification | "Ready for next round. Learnings recorded." |
| An agent passed verification | "Victory — consolidate and declare." |
| No agents running and no history | "Orchestration may be stale. Consider /winning:cancel." |
