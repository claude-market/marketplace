# Project Memory — Active Issues

How every project keeps its open threads alive across sessions, so neither any
assistant nor the user has to re-explain "what I'm currently working on" each time.
The convention is deliberately lean: distill, don't accumulate.

## The loop

| Stage | What happens | Trigger |
| --- | --- | --- |
| Capture | When a durable open thread surfaces (a live bug, a blocker, an in-flight investigation), the working assistant edits the project's `## Active Issues` block directly. Context/doc edits land on `main`, so the entry survives even if the worktree is later discarded. | live, during the session |
| Distill | `/wrap` reconciles each touched project's Active Issues: add new threads, remove resolved ones, update statuses, dedup, and migrate any resolved-with-lesson item to Technical notes / `references/gotchas.md`. | `/wrap` |
| Auto-load | Active Issues lives inside `context.md`, which assistants read before doing anything, so it loads next session for free. | session start |

A secondary reconcile runs at `consolidate_worktrees` (Phase 6) when parallel
worktrees converge: dedup and drop anything the merge resolved.

## The Active Issues section

Lives near the top of each `projects/<name>/context.md` (after Current Stage,
before deep technical sections). It is a WORKING SET, not a log — resolved
entries are deleted, never retained. If it grows past ~8-10 live entries, that
signals real work backing up, not a formatting problem.

Format:

    ## Active Issues

    Open threads only — current bugs, blockers, and in-flight work. Not a log:
    resolved issues are deleted; if a resolution leaves a durable lesson, migrate
    that lesson to Technical notes / references/gotchas and remove the entry here.
    Convention: references/project-memory.md

    - **[OPEN] <short title>** — <one line: what's wrong / what's needed>. <pointer: file, branch, or port>. (since YYYY-MM-DD)
    - **[BLOCKED] <short title>** — <what it's waiting on>. (since YYYY-MM-DD)
    - **[IN PROGRESS] <short title>** — <worktree / who is on it>. (since YYYY-MM-DD)

Statuses (the only three):

- `OPEN` — a known problem nobody is currently on.
- `IN PROGRESS` — actively being worked, usually in a named worktree.
- `BLOCKED` — cannot proceed until a stated precondition is met.

There is no lingering `RESOLVED`. Resolved means the entry is removed.

## The boundary (what goes where)

| Home | Holds | Lifespan |
| --- | --- | --- |
| Active Issues (this convention) | What is broken / blocked / in-flight right now | Transient — entries get removed |
| Technical notes (in `context.md`) | How the code works; permanent invariants and gotchas | Permanent |
| `decisions/log.md` | One-time directional choices | Permanent, append-only |
| Next Steps (where present) | Planned roadmap work | Until done |

Migration rule: when an Active Issue resolves AND leaves a lasting lesson, move
the lesson to Technical notes or `references/gotchas.md` and delete the Active
Issue. Resolved with no lasting lesson is simply deleted. Active Issues are
problems; Next Steps are plans — do not duplicate roadmap items here.

## Who maintains it

- Any assistant working a project: capture durable open threads live as they
  surface; flip a status when it changes; remove an entry the moment it resolves.
- `/wrap`: the per-session reconcile + prune (see the wrap skill, Steps 2/4/5).
- `consolidate_worktrees`: the post-merge dedup (Phase 6).
