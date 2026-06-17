# Projects

Each project lives in its own folder under `projects/<name>/`. A project can be
anything — research, writing, an app or site, planning, or any other body of
work that spans more than one session. There is no fixed folder layout. What a
project needs, its `context.md` defines.

The template ships with **no projects**. You (or an assistant) create one the
moment real work begins: make `projects/<name>/`, drop in a `context.md`, and
start.

## The one required file: `context.md`

Every project folder has a `context.md`. The owning assistant reads it before
doing anything, so it is the single source of truth for what the project is and
where it stands. At minimum it should answer:

| Field | What it captures |
| --- | --- |
| **What it is** | One or two lines — the project's purpose and scope. |
| **Owner** | Which assistant runs it (folio, lyren, pylon, or cantos). |
| **Current stage** | Where the work stands right now (e.g. scoping, drafting, building, review, shipped). |
| **Constraints** | Hard limits the work must respect — deadlines, tech stack, tone, format, budget, anything fixed. |
| **Active Issues** | The working set of open threads. See below. |

Beyond these, the owning assistant expands the file with whatever the project
actually needs (technical notes, source lists, a roadmap). Not every project
needs the same fields. Add them as they become relevant; don't pre-fill empty
structure.

A starting skeleton lives at `.claude/templates/context-template.md`.

## The `## Active Issues` block (Non-Negotiable)

Every `context.md` carries an `## Active Issues` block near the top, right after
Current Stage. It is the working set of open threads — current bugs, blockers,
and in-flight work — that loads at session start so no one re-explains "what I'm
working on" each time.

It is a working set, not a log. Resolved entries are deleted, never retained. If
a resolution leaves a durable lesson, migrate that lesson to the project's
technical notes or `references/gotchas.md`, then remove the entry.

Format:

    ## Active Issues

    Open threads only — current bugs, blockers, and in-flight work. Not a log:
    resolved issues are deleted; durable lessons migrate to technical notes /
    references/gotchas. Convention: references/project-memory.md

    - **[OPEN] <short title>** — <one line: what's wrong / what's needed>. <pointer: file, branch, or port>. (since YYYY-MM-DD)
    - **[BLOCKED] <short title>** — <what it's waiting on>. (since YYYY-MM-DD)
    - **[IN PROGRESS] <short title>** — <who / which worktree is on it>. (since YYYY-MM-DD)

The only three statuses:

- `OPEN` — a known problem nobody is currently on.
- `IN PROGRESS` — actively being worked.
- `BLOCKED` — cannot proceed until a stated precondition is met.

There is no lingering `RESOLVED` status. Resolved means the entry is removed. If
the block grows past roughly 8 to 10 live entries, that signals real work
backing up, not a formatting problem.

Full mechanics — how Active Issues is captured live, reconciled at `/wrap`, and
auto-loaded next session — live in `references/project-memory.md`.

## Access

The owning assistant decides how to structure its project folder. Other
assistants can read or work inside any project folder when a task requires it;
projects are not private.
