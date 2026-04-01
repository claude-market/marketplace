---
description: "Start a winning orchestration — deploys parallel agents that evolve until the goal is verified"
argument-hint: "GOAL [--strategies N] [--completion-promise TEXT]"
---

# Launch Winning Orchestration

This is a launcher only. It initializes state then delegates all orchestration logic to the winning skill.

## Step 1: Initialize

Execute the setup script:

```!
"${CLAUDE_PLUGIN_ROOT}/scripts/setup-loop.sh" $ARGUMENTS
```

If the script exits with a non-zero code, report the error to the user and stop. Do not proceed to Step 2.

## Step 2: Confirm Activation

Read `.claude/winning-orchestrator.local.md` to confirm the state file was created and contains valid configuration. If the file is missing or malformed, report the error and stop.

## Step 3: Delegate

Follow the orchestration process defined in `${CLAUDE_PLUGIN_ROOT}/skills/winning/SKILL.md` starting from "Phase 0 -- Refine". Present the user with the 4 goal refinement options, wait for their choice, THEN proceed to Round 1. Do not duplicate or reinterpret those instructions -- execute them as written.

When the goal is achieved, output `<promise>COMPLETION_PROMISE</promise>` with the exact promise text from the state file. Only output this when the statement is genuinely true.
