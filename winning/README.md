# winning

> Winning is all that matters. Winning is the only goal.

> v0.8.0

Evolutionary parallel strategy orchestrator for Claude Code. Deploys 3 agents on different strategies, compares results against verifiable tests, records learnings, adjusts approach, and redeploys. **Never stops until the goal is achieved.**

## Quick Start

```bash
/winning:launch "Build a REST API with CRUD operations and full test coverage"
```

The orchestrator begins with **Phase 0 — Goal Refinement**:

```
GOAL REFINEMENT -- Pick one or type your own:

(1) FAITHFUL REWRITE -- Restructured, nothing added.
(2) SUGGESTED METRICS -- Goal + concrete recommended metrics.
(3) 10X METRICS -- Same goal, 10x the bar.
(4) TYPE SOMETHING ELSE -- Describe your goal differently.
```

Pick a number. Then the evolutionary loop starts.

## How It Works

```
User Goal
    |
    v
Phase 0: REFINE -- Present 4 goal options, user picks one
    |
    v
Round 1: DEPLOY -- 3 agents (opus model), different strategies, same goal
    |               Each agent works in isolated worktree, no cycle limit
    v
    COMPARE -- Run VERIFICATION_COMMAND on each agent's output
    |
    |-- Any passes? --> VICTORY (consolidate, done)
    |
    |-- None pass? --> Record LEARNINGS in .claude/winning-history.local.md
    |                  |
    v                  v
Round 2: DEPLOY -- 3 NEW agents, informed by Round 1 learnings
    |               Read history file, avoid failed approaches
    v
    COMPARE -- Run VERIFICATION_COMMAND again
    |
    |-- Any passes? --> VICTORY
    |-- None pass? --> Record learnings --> Round 3 --> ...
    |
    v
  (repeat until VERIFICATION_COMMAND passes)
```

### Key Principles

- **No cycle limits** — agents work until done or blocked
- **No round limits** — orchestrator loops until goal is verifiably achieved
- **Learnings persist** — `.claude/winning-history.local.md` accumulates across rounds
- **Evolutionary** — each round's strategies are informed by all previous failures
- **Opus model** — agents use the most capable model available

## Commands

| Command                          | Description                                             |
| -------------------------------- | ------------------------------------------------------- |
| `/winning:launch GOAL [OPTIONS]` | Start orchestration with goal refinement                |
| `/winning:how-to-win QUESTION`   | Research what winning means before deploying strategies |
| `/winning:status`                | Show current round and learnings                        |
| `/winning:cancel [--force]`      | Cancel orchestration (history preserved)                |

### Launch Options

| Option                      | Default         | Description                       |
| --------------------------- | --------------- | --------------------------------- |
| `--strategies N`            | 3               | Number of agents per round (1-10) |
| `--completion-promise TEXT` | "GOAL ACHIEVED" | Phrase signaling completion       |

### Cancel

`/winning:cancel` stops the orchestration and preserves the history file. Learnings from completed rounds remain in `.claude/winning-history.local.md` for future reference.

`/winning:cancel --force` cancels even if the orchestration belongs to a different session.

## Files

| File                                    | Purpose                             | Lifecycle                                                        |
| --------------------------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| `.claude/winning-orchestrator.local.md` | Loop state (round, session, config) | Created on launch, deleted on victory/cancel                     |
| `.claude/winning-history.local.md`      | Learnings from all rounds           | Created on Round 1, appended each round, **preserved on cancel** |

## Architecture

```
winning/
├── commands/
│   ├── launch.md              # /winning:launch — init state, delegate to winning skill
│   ├── how-to-win.md          # /winning:how-to-win — delegate to how-to-win skill
│   ├── status.md              # /winning:status — report round + learnings
│   └── cancel.md              # /winning:cancel — salvage + stop
├── skills/
│   ├── winning/               # Orchestrator (evolutionary loop logic)
│   │   ├── SKILL.md
│   │   └── references/
│   │       └── strategy-patterns.md  # Pattern library with decision tree
│   └── how-to-win/            # Pre-strategy research (3 rounds × 3 angles)
│       └── SKILL.md
├── agents/
│   ├── strategy-runner.md     # Execution agent (opus, tools: *, no cycle limit)
│   └── researcher.md          # Research agent (opus, 3 angles: codebase/domain/adversary)
├── hooks/
│   ├── hooks.json             # Stop hook registration
│   └── stop-hook.sh           # Loop engine (keeps session alive)
└── scripts/
    ├── setup-loop.sh          # Initialize orchestrator state
    ├── status.sh              # Report round status + history
    └── cancel-loop.sh         # Cancel with session verification
```

## Requirements

- Claude Code with plugin support
- `jq` and `perl` available in PATH
