---
name: how-to-win
description: This skill should be used when the user asks to "research what winning means", "figure out what success looks like", "research before starting", "how to win at X", "what does winning look like for X", or wants deep research before deploying strategies. Deploys 3 research agents across 3 rounds to build a comprehensive Winning Brief.
---

# How to Win

**3 rounds. 3 agents per round. Same angles every round. Each round goes deeper.**

Research skill that figures out what winning means for a specific situation. Deploys 3 research agents (Codebase Archaeologist, Domain Scout, Adversary) across 3 rounds. Each round reads previous findings and asks: "what did you miss?"

**Model requirement:** Use `model: "opus"` when dispatching researcher agents.

## The Loop

```
ROUND 1: Deploy 3 researchers (Archaeologist, Scout, Adversary)
  → Combine findings

ROUND 2: Deploy same 3 researchers, they read Round 1 findings
  → "Here's what was found. What was missed? Go deeper."

ROUND 3: Deploy same 3 researchers, they read Rounds 1+2 findings
  → "Final pass. What's still missing?"

→ Synthesize all 9 reports into WINNING BRIEF
```

Fixed at 3 rounds. Same 3 angles every round. Each round builds on the last.

## The Three Angles

| Agent | Angle | Focus | Key Question |
|-------|-------|-------|-------------|
| A | **Codebase Archaeologist** | Code, git history, tests, dependencies, patterns, tech debt | "What does the code say?" |
| B | **Domain Scout** | Web search, docs, best practices, benchmarks, industry standards | "What does the world say?" |
| C | **Adversary** | Failure modes, risks, hidden constraints, breaking changes | "What will go wrong?" |

## History File

All findings are persisted in `.claude/how-to-win-history.local.md`. This file:
- Is created at Round 1 (empty)
- Is appended after each round with all 3 agents' findings
- Is read by every agent at the start of their work
- Persists across sessions

Format:

```
---
question: [the research question]
rounds_completed: [N]
---

## Round 1
- Archaeologist: [key findings summary]
- Scout: [key findings summary]
- Adversary: [key findings summary]

## Round 2
- Archaeologist: [new findings, what was missed]
- Scout: [new findings, what was missed]
- Adversary: [new findings, what was missed]

## Round 3
...
```

## Round 1 — First Research Pass

1. Create `.claude/how-to-win-history.local.md` with question in frontmatter, empty body
2. Dispatch 3 researcher agents with `run_in_background: true`, `model: "opus"`:

**Agent A brief:**
```
RESEARCH BRIEF
==============
QUESTION: [user's question]
YOUR ANGLE: Codebase Archaeologist
ROUND: 1

Investigate from the CODEBASE angle. Dig into the actual code, git history,
tests, dependencies, and patterns. Answer: "What does the code say about this?"

HISTORY FILE: .claude/how-to-win-history.local.md
  Read this file FIRST. It will be empty for Round 1.

Provide evidence for every finding (file paths, git output, code snippets).
```

**Agent B brief:**
```
RESEARCH BRIEF
==============
QUESTION: [user's question]
YOUR ANGLE: Domain Scout
ROUND: 1

Investigate from the DOMAIN angle. Search the web, read docs, find best
practices, benchmarks, and industry standards. Answer: "What does the world say?"

HISTORY FILE: .claude/how-to-win-history.local.md
  Read this file FIRST. It will be empty for Round 1.

Provide evidence for every finding (URLs, quotes, benchmark numbers).
```

**Agent C brief:**
```
RESEARCH BRIEF
==============
QUESTION: [user's question]
YOUR ANGLE: Adversary
ROUND: 1

Investigate from the ADVERSARY angle. Find reasons things will fail, edge cases,
hidden constraints, dependency risks, breaking changes. Answer: "What will go wrong?"

HISTORY FILE: .claude/how-to-win-history.local.md
  Read this file FIRST. It will be empty for Round 1.

Provide evidence for every finding (file paths, dependency versions, known issues).
```

3. Wait for all 3 to complete
4. Append findings to `.claude/how-to-win-history.local.md`

## Round 2 — What Did You Miss?

1. Append Round 1 findings to history file
2. Dispatch same 3 agents, same angles, but add to each brief:

```
ROUND: 2

PREVIOUS FINDINGS are in .claude/how-to-win-history.local.md.
Read them carefully. Your job this round:
- What was MISSED in Round 1?
- What was WRONG in Round 1?
- Go DEEPER on your angle — don't repeat what's already known.
```

3. Wait for all 3 to complete
4. Append findings to history file

## Round 3 — Final Pass

1. Append Round 2 findings to history file
2. Dispatch same 3 agents, same angles, but add to each brief:

```
ROUND: 3 (FINAL)

ALL PREVIOUS FINDINGS are in .claude/how-to-win-history.local.md.
Read them carefully. This is the final pass. Your job:
- What is STILL missing after 2 rounds?
- Are there any CONTRADICTIONS between findings?
- What's the single most important thing from your angle?
```

3. Wait for all 3 to complete
4. Append findings to history file

## Synthesis — The Winning Brief

After Round 3, synthesize ALL 9 reports into one brief:

```
WINNING BRIEF
=============
QUESTION: [original question]
ROUNDS: 3
AGENTS_DEPLOYED: 9

SITUATION:
  [evidence-backed current state, from Archaeologist]

REAL GOAL:
  [refined and measurable, informed by all 3 angles]

SUCCESS METRICS:
  - [specific, measurable, with industry context from Scout]

VERIFICATION_COMMAND:
  [concrete command to prove success, if applicable]

RECOMMENDED STRATEGY PATTERN:
  [from references/strategy-patterns.md, informed by research]

WHAT WILL WORK:
  - [approach — evidence from Scout + Archaeologist]
  - [approach — evidence]

WHAT WON'T WORK:
  - [approach — evidence from Adversary + Archaeologist]
  - [approach — evidence]

RISK MAP:
  - [risk]: [evidence] → [mitigation]
  - [risk]: [evidence] → [mitigation]

CONSTRAINTS:
  - [hard limits all strategies must respect]

CONFIDENCE: [High / Medium / Low]
REMAINING UNCERTAINTY:
  - [anything still unclear after 3 rounds]
```

## Output

Present the Winning Brief to the user. They can:
- Use it to inform a `/winning:launch` with a refined goal
- Use it as standalone research
- Ask follow-up questions
