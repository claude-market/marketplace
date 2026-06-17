---
name: wrap
description: Use when ending a session, wrapping up, or saying "session end", "wrap up", "update files". Reviews the conversation and updates brain files, workflows, registry, and decisions log based on what happened.
---

## What This Skill Does

End-of-session review. You look at what happened this session, extract anything worth keeping, and update the right files. Then commit.

`/wrap` is the authoritative end-of-session marker. The user invokes it only when the work is done, reviewed, and approved — never as a mid-session checkpoint. Treat this as the definitive close: the work is final, which licenses decisive consolidation. Don't tentatively jot what happened — lock in the wholistic patches that make this session's lessons permanent and stop their whole class from recurring.

This is the permanent record of the session. Do it right.

---

## Step 1 — Identify the Active Assistant

Look at how this session started. Which assistant morphed in? Options:

- `folio` → brain file: `.assistants/folio/folio.md`
- `lyren` → brain file: `.assistants/lyren/lyren.md`
- `pylon` → brain file: `.assistants/pylon/pylon.md`
- `cantos` (no morph) → no single brain file; update system-level files only
- any assistant added during setup → its brain file at `.assistants/<name>/<name>.md`

---

## Step 1.5 — Consume the Brain Update Queue

Before reviewing the live conversation, check `.tmp/brain-update-queue.md`. When the optional `brain_update_hook.py` Stop hook is wired (see its activation note in `.assistants/cantos/cantos.md`), it writes candidate rules there at session end; it never auto-applies them, so wrap is where they get routed. The hook is opt-in and may be unwired — in that case the file is simply absent and you review the conversation directly (this step still runs from Step 2 onward).

For each unprocessed entry in the queue:

1. Read the candidate (assistant tag, proposed rule, evidence).
2. Run it through the three-question routing test in Step 3 below — same as for any candidate surfaced from this session's conversation.
3. If applied, move the entry to a `## Applied` section at the bottom of the queue file with a one-line note on what was edited and where.
4. If discarded (the candidate was a false positive — wrap notes the reason), move it to a `## Discarded` section.
5. Never leave entries lingering in the queue — every wrap empties the unprocessed section.

If the queue file doesn't exist, skip this step.

---

## Step 2 — Review the Session

Scan the full conversation for signals in these categories. Be ruthless about what qualifies — only things worth keeping permanently.

**Lift every signal from incident to class.** Each category below tends to surface a *specific* thing that happened. Before recording any of them, run Step 0 (Generalize to the class) from `references/brain-file-architecture.md`: name the general category the incident belongs to and capture the broadest fix that stops the whole class. A correction is evidence of a class of problem the system permits — patch the class, not the instance. The "Implicit corrections" category below is this same move applied to tools and workflows; apply its spirit to all eight categories.

**Rules and corrections (→ brain file `## Auto-updates`)**
- The user said "don't", "always", "never", "instead", "from now on", "stop doing"
- The user corrected an approach or output
- A strong preference emerged that wasn't followed initially
- Something the assistant got wrong and had to fix

**Implicit corrections — things the user asked for that should've been automatic (→ tool/workflow file + brain file)**
- The user asked to do something manually that a tool or workflow should have handled on its own
- The user requested a cleanup, sort, format, or fix that should happen every time as part of the pipeline
- The signal is: "the user shouldn't have had to ask for this." If the request reveals a missing step in an existing tool or workflow, that's a gap — fix the tool/workflow so it happens automatically, and log the rule in the brain file
- This is the most commonly missed category. A request to fix output IS a correction of the tool that produced it, even if the user doesn't phrase it as one

**Workflow gaps (→ the relevant workflow file)**
- The assistant hit a step that wasn't covered in the workflow and had to improvise
- A workaround was used instead of a documented process
- A step in the workflow was wrong or missing

**New tools, workflows, sub-agents built (→ `registry/index.md` + brain file tools table)**
- A new script, tool, or workflow was created this session

**Decisions made (→ `decisions/log.md`)**
- A meaningful choice was made that affects system behavior, the user's priorities, or is worth remembering across sessions
- Format: `[YYYY-MM-DD] DECISION: ... | REASONING: ... | CONTEXT: ...`

**Stale reference docs (→ `references/`)**
- A reference doc was visibly wrong or missing information that came up this session

**Implicit patterns and recurring preferences (→ context file or brain file)**
- The user nudged the same style, tone, or approach more than once without explicitly stating a rule
- The assistant kept defaulting to something the user kept overriding — even without "don't" or "always"
- A preference emerged through repeated correction rather than declaration
- Examples: UI style direction repeated across multiple components; always restructuring output the same way; consistently preferring a shorter/longer response style
- Where to write: project-specific patterns go in the project's `context.md`; general preferences about how the user works go in `context/me.md`; assistant-specific behavior patterns go in the assistant's brain file `## Auto-updates`
- Write as a standing rule, not an observation. "Use shadcn/ui components with minimal custom CSS" not "the user kept using shadcn"

**Active Issues — open project threads (→ project `context.md` `## Active Issues`)**
- A new bug, blocker, or in-flight investigation surfaced this session that the next session on this project needs to inherit
- An existing Active Issue was resolved, or its status changed (OPEN ↔ IN PROGRESS ↔ BLOCKED)
- The signal: "the next session on this project would waste time without knowing this." Format and the four-home boundary live in `references/project-memory.md`.

If none of these apply — the session was clean task execution with no corrections, no new builds, no decisions — say so and exit. Don't pad files.

---

## Step 3 — Route Each Finding (Three-Question Test)

**Step 3.0 — Generalize to the class first (Non-Negotiable).** Before routing any finding to a home, run Step 0 from `references/brain-file-architecture.md` on it:

1. Name the class — the specific incident is one instance of what general category of problem?
2. Find the broadest correct fix that prevents the whole class (a gate, a workflow step, a tool change, a prose principle), not just this instance.
3. Carry that generalized fix — not the episode — into the routing test below.

You cannot route or record a finding until you have asked "what class does this belong to, and what wholistic patch kills the class?" If a one-off fix can be generalized to prevent its whole class, that generalized fix is what gets recorded. The episode itself belongs in the commit message, never in an instruction file.

Then route each finding through the routing test from `references/brain-file-architecture.md`. Auto-updates is a LAST RESORT, not the default.

For every candidate lesson, ask in order:

**Q1: Does this lesson update existing prose in the brain file or a workflow?**

If yes, edit the prose directly. Examples:
- A worktree-merge rule → fold into the Pre-Task Gate or `consolidate_worktrees` workflow
- A testing convention → into the "Browser Testing" section
- A design principle → into "Design Guardrails"

The lesson is stronger inside the section where the decision happens than as a bullet at the bottom.

**Q2: Does this need a dedicated Non-Negotiable gate?**

If the lesson is a structural rule that must block action (like "cannot report done until X"), write a new `## Section (Non-Negotiable)` block with a numbered checklist, parallel to existing gates like Pre-Task Gate. Bullets don't block; numbered gates do.

**Q3: Is this tactical, procedural, or mechanical?**

| Lesson type | Goes to |
| --- | --- |
| Library quirk, environment gotcha, tool-specific tidbit | `references/gotchas.md` (loaded on demand) |
| Project-specific fact (selectors, internal APIs, file paths) | `projects/<name>/context.md` |
| Multi-step procedure | `workflows/<assistant>/<name>.md` |
| Reusable pattern triggered by keywords | A skill in `.claude/skills/` |
| Must run at a fixed lifecycle event (every commit, every file edit) | A hook in `.claude/settings.json` |

If the lesson has a home in any of those, route it there — do NOT add an Auto-updates bullet.

**Only if all three questions return no** — and the lesson is a genuine cross-cutting principle with no other home — does it become an Auto-updates entry. Even then, check for overlap with existing entries and existing prose before appending.

## Step 4 — Make the Updates

Now make the edits routed by Step 3.

**Brain file Auto-updates** (rare, last resort): Append using the format:
```
- [YYYY-MM-DD] <rule in one or two sentences, written as a direct instruction>
```

Strict rules:
- **One or two sentences max.** If it needs more, it's a workflow or skill, not a bullet.
- **Cross-cutting only** — applies across projects and across sections of work.
- **No episode narratives.** "[Date] today I learned..." → reword as a standing instruction.
- **Don't duplicate existing entries or prose** — check both before appending.

**Brain file prose sections** (most common destination): Edit the relevant section directly. Keep changes scoped and small.

**Workflow files:** Edit only the specific step that had the gap. Don't rewrite untouched sections.

**Registry:** Add rows for anything new. Follow existing table format exactly.

**Decisions log:** Append at the bottom. Never edit past entries.

**References / gotchas:** Add a new subsection in `references/gotchas.md` with the library/tool name as a heading. Include code if relevant.

**Project Active Issues:** For each project touched this session, reconcile its `## Active Issues` block in `projects/<name>/context.md` (convention: `references/project-memory.md`):
- Add an entry for each durable open thread discovered (statuses: OPEN / IN PROGRESS / BLOCKED).
- Remove every entry resolved this session. If a resolution left a durable lesson, migrate it to Technical notes or `references/gotchas.md` FIRST, then delete the Active Issue (the migration rule).
- Update the status tag of any entry whose state changed.
- Active Issues are problems/blockers, NOT roadmap — never duplicate Next Steps here.

## Step 5 — Prune and Audit for Recurrence

After all additions are made:

**Recurring-pattern audit (the wholistic check — do this first).** Scan for any pattern that recurs across sessions: does this session's finding echo an existing Auto-updates bullet, repeat a correction the user has made before, or add yet another instance to a growing pile (e.g. a third project-specific entry in `references/gotchas.md` for the same root cause)? A pattern that recurs without a sharp gate enforcing the right behavior is the signal that a *class* was never patched — only its instances were logged. When you find one, replace the accumulating specific bullets with ONE wholistic gate or prose rule that prevents the whole class, per the cantos.md "When to Audit Brain Files" triggers and `workflows/cantos/audit_brain_files.md`. This is how `/wrap` stops generating the same lesson wrap after wrap.

**Auto-updates sections of every brain file you touched:**
- If it has more than ~10 entries, audit for migration candidates
- Collapse near-duplicates
- Migrate any tactical entries that have crept in into `references/gotchas.md`, workflows, or prose sections
- Delete anything that no longer applies

**`references/gotchas.md` (if touched this session):** confirm every entry you added is a *reusable* library / tool / environment quirk that will recur across projects. Any entry that is really a single codebase's coordinate — an internal file path, a project-only env flag, a one-project component name — is project-specific; move it to that `projects/<name>/context.md` (Technical notes) instead. gotchas is the portable-quirks reference, not a per-project scratchpad.

**`## Active Issues` of every project touched (hard guard):** delete resolved entries, collapse duplicates, and confirm nothing duplicates an existing Technical notes bullet. A completed-work narrative (BUILT / SHIPPED / RESOLVED / CONSOLIDATED / ACCEPTED) does NOT belong in Active Issues — it is open threads only. Migrate each completed entry's durable record to `decisions/log.md` (the decision) or Technical notes (the invariant), then remove it. If the block still exceeds ~10 live OPEN threads after that, surface it to the user — that is real backlog, not a formatting problem. Do not carry a completed narrative forward "for context"; the decisions log is that context.

To check whether an on-demand reference / workflow / skill is dead weight before pruning or migrating, run `python3 tools/cantos/file_usage_audit.py` — it reports read frequency and a never-read list across all sessions (the instrument for the cantos.md audit triggers).

A clean Auto-updates section — and a clean Active Issues block — should have FEWER entries each month, not more.

---

## Step 6 — Commit

Stage only the files you touched this session (never `git add -A`). Commit with:

```
wrap: [assistant name] session [YYYY-MM-DD]
```

Include a brief body listing what was updated. Example:

```
wrap: lyren session 2026-05-05

- brain file: added calendar routing rule
- decisions/log.md: logged MCP connector selection decision
```

Push after committing if the repo has a configured remote; otherwise the commit alone is the record.

---

## Step 7 — Report

Tell the user what was updated. Keep it short — one line per file touched. If nothing needed updating, say "nothing to update this session" and stop.

---

## Guardrails

- **Prefer the wholistic patch over the specific record.** If a one-off fix can be generalized to prevent its whole class — a gate, a workflow step, a tool change, a prose principle — do that instead of logging the incident. The instance belongs in the commit message; the class-level fix belongs in the system. (This is Step 0 / Step 3.0 — it governs the whole wrap, not just routing.)
- **Default to prose, not bullets.** Most lessons update an existing section, not Auto-updates. If you find yourself writing a bullet, run the three-question test again.
- **Do not commit unrelated staged changes** — only stage files you edited in this step.
- **Do not add entries that are already covered** by prose elsewhere in the brain file or by an existing workflow / skill.
- **Do not log routine task completions as decisions** — only meaningful choices.
- **If the session had no feedback and no new builds**, say so and skip the commit.
- **Brain file entries are permanent instructions**, not session notes — write them as rules, not observations.
