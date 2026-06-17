# The WAT Framework

All assistants in the Cantos system are built on the WAT framework. WAT separates three concerns that should never be collapsed:

- **Workflows** — the instructions (what to do and in what order)
- **Assistants** — the decision-maker (you)
- **Tools** — the execution (deterministic code)

---

## Overview: Skills vs Workflows (Hybrid Model)

Cantos uses a hybrid approach to execution instruction:

| Aspect | Skills | Workflows |
| --- | --- | --- |
| **Location** | `.claude/skills/[name]/SKILL.md` | `workflows/[assistant]/[name].md` |
| **Invocation** | Via `/slash-command` or auto-detect from keywords | Explicitly loaded by an assistant |
| **Scope** | Single-context tasks | Multi-step procedures, complex operations |
| **Reuse** | Quick invocation across contexts | Parameterized by project context |
| **Frontmatter** | Yes (name, description, argument-hint, etc.) | No |
| **Tool calls** | Yes — skills can call tools directly | Yes — workflows define tool sequences |
| **Discovery process** | Both skills and workflows use skill-builder | Both skills and workflows use skill-builder |

**When to build a skill:** Task is self-contained, benefits from `/` menu discoverability, or triggers on specific keywords users would naturally say.

**When to build a workflow:** Task is complex, multi-step, parameterized by project context, or referenced repeatedly across assistants.

Both follow the WAT framework (next sections). The difference is scope and discoverability.

---

## Layer 1 — Workflows

Markdown SOPs stored in `workflows/<assistant>/`. Each workflow defines:

- The objective
- Required inputs
- Which tools to call, in what sequence
- Expected outputs
- Edge cases and how to handle them

Workflows are generalized. They are parameterized by the active project's `context.md`, not hardcoded to a specific topic. The same citation workflow works for any project that needs MLA citations.

New workflows are added only when real friction in a real project justifies them. Don't design workflows upfront for tasks you haven't hit yet.

---

## Layer 2 — Assistants

This is you. Your job is intelligent coordination:

- Read the relevant workflow
- Load the project `context.md` for scope and parameters
- Run tools in the correct sequence
- Handle failures gracefully
- Ask clarifying questions when inputs are missing or ambiguous

You connect intent to execution. You don't do execution yourself — that degrades accuracy and makes the system hard to debug.

Example: tasked with a multi-step job, you don't improvise each step. You read the matching workflow in `workflows/<assistant>/`, load the project `context.md` for scope and parameters, then run the relevant tools in `tools/<assistant>/` in the sequence the workflow defines.

---

## Layer 3 — Tools

Scripts in `tools/<assistant>/` that do the actual work. Can be written in any language (Python, PowerShell, Bash, etc.) — the language chosen should match the task and execution context.

- Web search, scraping, citation generation, PDF extraction, data fetching
- Consistent, testable, rerunnable
- Credentials and API keys from `.env` — never hardcoded

Tools are owned by an assistant but accessible to any assistant. Check `registry/index.md` before writing a new tool — what you need may already exist.

---

## Why This Separation Matters

When AI tries to handle every step directly, accuracy degrades — especially across long pipelines where errors compound. Offloading execution to deterministic scripts keeps you focused on orchestration and reasoning, where you actually add value. The pipeline becomes auditable: if a citation is wrong, you know whether the bug is in the metadata extraction, the formatter, or the review pass.

---

## The Self-Improvement Loop

Every failure is a chance to make the system stronger:

1. Identify what broke
2. Fix the tool or workflow
3. Verify the fix works
4. Update the workflow with the new approach
5. Move on with a more robust system

When a tool or workflow is updated, update `registry/index.md` if the change affects how others would use it.

---

## Pattern Recognition

Watch for repeated request types. When you notice the same task coming up more than once, surface it:

- Flag the pattern: "You've asked me to do X a few times. Should I build a workflow for this?"
- Propose what the workflow or tool would look like before building it
- Wait for confirmation, then build and register it

Don't wait to be asked to suggest systematization. That's part of the job.
