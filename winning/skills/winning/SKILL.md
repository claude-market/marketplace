---
name: winning
description: This skill should be used when the user asks to "optimize a task with parallel strategies", "deploy winning strategies", "run competing approaches", "find the best approach by trying multiple strategies", or mentions "winning", "parallel optimization", "strategy competition". Orchestrates multiple background agents running Ralph-style loops to converge on the best solution.
---

# Winning Orchestrator

**Never stops until the goal is achieved.** Evolutionary loop: deploy 3 agents on the same goal -> compare results -> if goal not verified -> record learnings -> adjust prompts -> redeploy 3 agents -> repeat until VERIFICATION_COMMAND passes. No cycle limits. No round limits. No giving up.

**Model requirement:** Use `model: "opus"` when dispatching strategy-runner agents. Winning demands the most capable model available.

## The Loop

```
ROUND N:
  1. Deploy 3 agents (different strategies, same goal)
  2. Wait for all to complete
  3. Run VERIFICATION_COMMAND on each agent's output
  4. If any passes -> VICTORY (consolidate that agent's work)
  5. If none pass -> collect LEARNINGS from all 3 agents
  6. Record learnings in ROUND_HISTORY
  7. Adjust prompts based on learnings (what to try, what to avoid)
  8. -> ROUND N+1
```

No artificial cycle limits. No artificial round limits. Loop until the goal is verifiably achieved or the user cancels.

## Phase 0 -- Refine (Before Round 1)

Present **exactly 4 options**:

```
GOAL REFINEMENT -- Pick one or type your own:

(1) FAITHFUL REWRITE -- Restructured, nothing added.
    GOAL: [restate exact intent]  SUCCESS_METRIC: [from their words]  VERIFICATION: [obvious check]

(2) SUGGESTED METRICS -- Goal + concrete recommended metrics.
    GOAL: [intent + measurable targets]  SUCCESS_METRIC: [numbers/thresholds/pass-fail]  VERIFICATION: [specific command]

(3) 10X METRICS -- Same goal, 10x the bar.
    GOAL: [ambitious level]  SUCCESS_METRIC: [stretch targets]  VERIFICATION: [rigorous multi-point check]

(4) TYPE SOMETHING ELSE -- Describe your goal differently.
```

- Option 1: pure restructuring, add nothing user didn't say
- Option 2: industry-standard metrics (code -> coverage% + test count; perf -> latency + throughput; content -> word count + structure)
- Option 3: multiply Option 2 numerics by 2-5x
- All options need concrete VERIFICATION command
- Already precise goal -> recommend option 1 pre-selected
- Wait for selection, fill Goal Definition Template, proceed to Round 1

## History File

All round results and learnings are persisted in `.claude/winning-history.local.md`. This file:
- Is created by the orchestrator at Round 1 (empty history)
- Is appended after each round with results and learnings
- Is read by every agent at the start of their work
- Persists across sessions (resume where you left off)
- Persists on cancel and victory — only deleted if the user manually removes it

Format:

```
---
goal: [one-line goal]
verification_command: [exact command]
rounds_completed: [N]
---

## Round 1
- Agent A ([strategy]): [STATUS]. Verification: [pass/fail + output]. Learned: [key takeaway]
- Agent B ([strategy]): [STATUS]. Verification: [pass/fail + output]. Learned: [key takeaway]
- Agent C ([strategy]): [STATUS]. Verification: [pass/fail + output]. Learned: [key takeaway]
KEY INSIGHT: [most important thing learned]
APPROACHES TO AVOID: [what demonstrably didn't work]

## Round 2
...
```

## Round 1 -- First Deployment

1. Fill Goal Definition Template (all fields required)
2. Load `references/strategy-patterns.md`, pick pattern via Selection Guide
3. Fill Strategy Decomposition Template (one per strategy, 3 strategies)
4. Create `.claude/winning-history.local.md` with goal and verification_command in frontmatter, empty body
5. Dispatch all 3 as background Agents with `run_in_background: true` and `model: "opus"`
6. Use `isolation: "worktree"` when `ISOLATION_NEEDED=yes`
7. Tell each agent: "Read `.claude/winning-history.local.md` for learnings from previous rounds"

## Round N+1 -- Evolutionary Redeployment

When Round N results are in and no agent passed verification:

1. Collect LEARNINGS from all 3 agents' final reports
2. Collect VERIFICATION output from each (what failed and why)
3. **Append** to `.claude/winning-history.local.md`:
   ```
   ## Round [N]
   - Agent A ([strategy]): [STATUS]. Verification: [pass/fail + key output]. Learned: [key takeaway]
   - Agent B ([strategy]): [STATUS]. Verification: [pass/fail + key output]. Learned: [key takeaway]
   - Agent C ([strategy]): [STATUS]. Verification: [pass/fail + key output]. Learned: [key takeaway]
   KEY INSIGHT: [the most important thing learned this round]
   APPROACHES TO AVOID: [what demonstrably didn't work]
   ```
4. Update `rounds_completed` in the history file frontmatter
5. Design 3 NEW strategies informed by learnings:
   - Each strategy MUST address at least one failure from previous round
   - Each strategy MUST avoid approaches listed in APPROACHES TO AVOID
   - At least one strategy should try a fundamentally different angle
   - Include ROUND_HISTORY in each agent's brief so they don't repeat mistakes
5. Dispatch all 3 agents with the updated briefs

## Comparing Results

After all 3 agents in a round complete:

1. Run VERIFICATION_COMMAND against each agent's output (in their worktree if isolated)
2. Score results:

| Verification | Progress | Action |
|--------------|----------|--------|
| PASSES | 100 | VICTORY -- consolidate this agent's work |
| Partial pass (some tests pass, some fail) | 50-89 | Record what passed, feed to next round |
| FAILS entirely | 0-49 | Record failure reason, feed to next round |
| Agent BLOCKED | 0 | Record blocker, avoid this approach next round |

3. If multiple agents pass -> pick the one with the cleanest output (fewest files changed, simplest diff)
4. If no agents pass -> proceed to Round N+1

## Agent Brief Template

Each agent in a round receives:

```
STRATEGY BRIEF
==============
GOAL: [from Goal Definition]
SUCCESS_METRIC: [from Goal Definition]
VERIFICATION_COMMAND: [from Goal Definition]

YOUR STRATEGY: [name] -- [approach]
FIRST_ACTION: [from decomposition]

HISTORY FILE: .claude/winning-history.local.md
  Read this file FIRST. It contains learnings from all previous rounds.
  Do NOT repeat approaches listed under APPROACHES TO AVOID.

RULES:
- Read .claude/winning-history.local.md before starting
- Work until VERIFICATION_COMMAND passes or you are blocked
- No cycle limit -- keep going
- Run VERIFICATION_COMMAND whenever you have a candidate solution
- Include LEARNINGS in your final report (what worked, what didn't, what to try next)
- Provide verification evidence for every claim
```

## Goal Definition Template

Fill BEFORE deploying. Reject if any field not concrete.

```
GOAL: [one sentence, specific and measurable]
SUCCESS_METRIC: [binary pass/fail -- e.g., "all 47 tests pass", "response time < 200ms"]
VERIFICATION_COMMAND: [exact command proving success]
STRATEGY_COUNT: [always 3]
COMPLETION_PROMISE: [exact output phrase on achievement]
ISOLATION_NEEDED: [yes/no -- yes if strategies modify overlapping files]
```

"Make it better" is not a goal. "All 47 tests pass with >80% coverage" is.

## Strategy Decomposition Template

One per strategy. Each MUST differ in approach, not minor details.

```
STRATEGY [A/B/C]:
  NAME: [short label]
  APPROACH: [1-2 sentences, fundamentally different path]
  FIRST_ACTION: [exact first thing agent does]
  ADDRESSES_PREVIOUS_FAILURE: [which Round N failure this strategy targets, or "N/A" for Round 1]
  RISK: [primary failure mode]
```

Diversity check: no shared first actions, no identical intermediate artifacts, each succeeds independently.

## ROUND_HISTORY Format

Maintained across rounds. Grows with each round. Passed to every agent.

```
ROUND_HISTORY
=============

ROUND 1:
- Agent A (TDD-first): FAILED. Learned: test framework setup took 3 cycles, leaving no time for implementation. Verification: 0/47 tests pass.
- Agent B (Prototype-first): PARTIALLY_SUCCEEDED. Learned: prototype works for 3/5 endpoints, validation missing. Verification: 12/47 tests pass.
- Agent C (Schema-first): FAILED. Learned: OpenAPI codegen produced incompatible types. Verification: build fails.
KEY INSIGHT: Prototype approach got closest -- validation is the gap, not architecture.
APPROACHES TO AVOID: OpenAPI codegen (type incompatibility), starting with test framework setup from scratch.

ROUND 2:
- Agent A (Prototype+Validation): SUCCEEDED. Learned: extending B's prototype with validation was fastest path. Verification: 47/47 tests pass.
...
```

## Victory

When VERIFICATION_COMMAND passes for any agent:

1. Consolidate that agent's work (merge from worktree if isolated)
2. Run VERIFICATION_COMMAND one final time on the consolidated result
3. If still passes -> append final round to `.claude/winning-history.local.md`, declare victory, output completion promise
4. If fails after merge -> treat as partial pass, continue to next round

## Consolidation Output

```
RESULT
======
WINNING_STRATEGY: [name] (Round [N])
ROUNDS_USED: [N]
TOTAL_AGENTS_DEPLOYED: [N * 3]

WHAT WAS DONE:
[bullet list of concrete changes/artifacts]

VERIFICATION:
[exact command and output]

ROUND_HISTORY:
[complete history showing evolution across rounds]

LESSONS:
- [what the evolutionary loop revealed]
- [which round's learnings were the breakthrough]
```

## References

- **`references/strategy-patterns.md`** -- pattern templates with selection guide
