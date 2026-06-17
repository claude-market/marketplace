# System Architecture

How the Cantos system is structured. Every assistant should know this.

---

## The Orchestrator

**Cantos** is the orchestrator. It reads every incoming request, identifies the right assistant, and hands off. Cantos does not execute tasks itself.

Two modes:

- **Morph** — for single-domain tasks. Cantos morphs into the right assistant and goes dormant. The assistant runs the rest of the session.
- **Orchestrate** — for multi-domain tasks with parallel workstreams. Cantos stays active, spawns assistants as sub-processes, collects their outputs, and synthesizes.

When you are loaded, Cantos has already handed off. You own the session from that point.

---

## Assistants

Assistants live in `.assistants/<name>/`. Each has a brain file at `.assistants/<name>/<name>.md`.

| Assistant | Role | Status |
| --- | --- | --- |
| cantos | Orchestrator and system architect — routes requests, owns structural health of every instruction file | Active |
| folio | Research, source finding, argument building, drafting, citations, AI-detection and humanizing | Active |
| lyren | Executive assistant — email, calendar, tasks, admin via MCP connectors; always drafts before sending or changing anything | Active |
| pylon | Engineer — web apps, sites, games, browser extensions, deployments; builds, self-iterates against screenshots and tests, ships finished work | Active |

When a new assistant is added, it appears in `.assistants/` and is registered in `registry/index.md`. Check there for the current list.

Assistants are capable end-to-end. Folio handles an entire research project — sourcing through final draft. When a task exceeds a single context window, the assistant spawns its own sub-agents internally. That complexity stays inside the assistant.

---

## Sub-agents

Sub-agents are specialized processes spawned by an assistant when a task is too large or requires a distinct domain. They live inside the owning assistant's folder:

```
.assistants/<name>/sub-agents/<sub-agent-name>.md
```

Sub-agents are not private. If one built for folio would help another assistant, it is listed in `registry/index.md` and can be loaded by any assistant by its full path.

Full convention in `.claude/rules/sub-agents.md`.

---

## The Registry

`registry/index.md` is the master lookup table for everything built in the system:

- Assistants — brain path, status, owned projects
- Tools — path, owning assistant, accessible by
- Workflows — path, owning assistant, accessible by
- Sub-agents — path, owning assistant, accessible by

**Check the registry before building anything new.** If something viable already exists, load and reuse it. When you build something new, register it immediately.

---

## Shared Resources

All shared resources are accessible to any assistant or Cantos:

| Resource type | Location | Purpose |
| --- | --- | --- |
| Tools | `tools/<assistant>/` | Execution scripts (any language: Python, PowerShell, Bash, etc.) |
| Workflows | `workflows/<assistant>/` | Markdown SOPs |
| Skills | `.claude/skills/` | Invocable task instructions and reasoning patterns — can make tool calls and produce file output |
| Templates | `templates/<assistant>/` | Document templates |
| References | `references/` | Shared architecture docs (this file) |

Skills and workflows differ in scope and invocation. Skills are self-contained, invoked via `/slash-command` or keywords, and designed for single-context tasks. Workflows are multi-step execution sequences parameterized by project context, referenced explicitly by assistants. Both can call tools and produce output.

**Browser automation — two-layer system:**

- **Layer 1 — skill:** `.claude/skills/playwright-cli/SKILL.md` contains reference documentation for how to operate playwright-cli commands (navigate, click, fill, capture screenshots, manage sessions, etc.). This is the instruction layer — it tells *how* to use the tool.
- **Layer 2 — sub-agent:** `.assistants/cantos/sub-agents/browser-agent.md` is the execution wrapper. It uses the playwright-cli skill to accomplish browser tasks on behalf of any assistant. This is what gets spawned when an assistant needs interactive web access.

These serve different purposes. The skill documents the tool; the sub-agent is the agent that applies it. Do not treat them as duplicates.

Specialized browser automations (site-specific, high-complexity) should get their own dedicated sub-agents built on top of the playwright-cli skill. Use WebSearch for simple information lookup; escalate to playwright only when real page interaction is needed.

**Playwright output files:** playwright-cli writes session artifacts (snapshots, console logs, screenshots, traces) to `.playwright-cli/` in the current working directory. This folder is gitignored. Per `browser-agent.md`, files must be moved from `.playwright-cli/` root into `.playwright-cli/current/<project>/` immediately after each playwright command — never leave artifacts scattered in the root. The `.playwright-cli/` folder is transient; nothing in it should be committed to git.

---

## Projects

Projects live in `projects/`. Projects span every domain — research and writing, engineering, admin, and business experiments — so the `context.md` format is not fixed. The owning assistant expands it based on what the project actually needs. Each `context.md` is the source of truth for:

- What the project is and its current stage
- Output constraints (rubric, spec, deadline, submission or deployment format)
- An `## Active Issues` block — the working set of open threads (convention in `references/project-memory.md`)
- Any project-specific notes, sources, or technical detail

A writing project tracks thesis, citation format, and sources; an engineering project tracks stack, ports, and bugs. Projects define their own structure beyond `context.md` based on what they actually need — don't assume a project has a `sources/` or `drafts/` folder. Check `context.md` first.

**Never mix outputs across projects.** All tool outputs write to the correct project subfolder.

---

## File Conventions

- `.env` — API keys and credentials. Never commit. Never hardcode keys anywhere else.
- `.tmp/` — intermediate outputs. Regenerable and disposable.
- `archives/` — nothing is deleted. Outdated material moves here.
- `decisions/log.md` — all meaningful decisions. Append-only.

---

## Context Files

`context/` contains the user's profile and work context. These are loaded by Cantos at the start of every session. You don't need to reload them yourself unless you need a specific detail.

- `context/me.md` — who the user is, roles, standing priorities and interests
- `context/work.md` — schedule, tools, task system, MCP connectors connected

Active work and priorities are not tracked in a single `context/` file. Each project's open threads live in its `## Active Issues` block inside `projects/<name>/context.md` (convention in `references/project-memory.md`), which loads when that project is active. Standing priorities live in `context/me.md`.

---

## Living System

This system is never finished. Every assistant, workflow, tool, sub-agent, and reference doc should get better through use — not sit static after it's first written.

The expectation, for every part of the system:

- **Errors** — when something breaks, fix the root cause and update the relevant file so it can't break the same way again
- **Feedback** — when the user corrects or redirects, update the relevant file immediately; don't carry a mental note, write it down
- **Usage** — when you notice a better approach during a task, update the workflow or tool after the task; don't defer
- **Patterns** — when the same type of task keeps coming up, surface it and propose systematizing it

No file is sacred. Every `.md`, every `.py`, every workflow is a working draft that improves through contact with real work. Stale files cause bad decisions — keeping things current is part of every assistant's job, not optional cleanup.

Minor updates (stage changes, small corrections) can be made silently. Changes that meaningfully affect system behavior — flag to the user first, then update.
