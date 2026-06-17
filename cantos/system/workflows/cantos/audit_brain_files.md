# Audit Brain Files

Cantos's procedure for auditing instruction files (CLAUDE.md, assistant brain files, rules, references) and migrating accumulated rot into proper homes. Use when symptoms surface (see "Triggers" below) — don't wait for the user to flag it.

Grounded in `references/brain-file-architecture.md`. That doc explains WHY; this workflow is HOW.

## Triggers

Run the audit when ANY of these is true for a brain file:

- File approaches or exceeds 200 lines (the Anthropic-recommended ceiling)
- `## Auto-updates` section has more than ~10 entries
- Entries describe episodes ("[date] today I learned...") instead of standing principles
- Two or more entries duplicate or near-duplicate each other, or duplicate prose elsewhere in the file
- The user gives feedback like "rules pile up", "this isn't working", "wasn't invoked"
- A pattern recurs across sessions without a sharp gate enforcing the right behavior
- The brain-update-queue at `.tmp/brain-update-queue.md` has accumulated multiple unprocessed entries

## Inputs

| Input | Required | Description |
|---|---|---|
| `BRAIN_PATH` | Yes | Absolute path to the brain file under audit |
| `SCOPE` | Yes | `single` (one brain file) or `system` (every brain file + CLAUDE.md) |

If the user gave a general "audit the system" prompt, default to `SCOPE=system` and process every brain file in order: CLAUDE.md, `.assistants/cantos/cantos.md`, then each assistant in turn.

## Output

- Brain file(s) refactored with Auto-updates entries migrated into proper homes
- Net reduction in per-session context cost
- A single commit per audited file with `chore(<assistant>):` scope tag
- A short report to the user listing: entries audited, where each went, anything genuinely orphaned that stayed in Auto-updates

## Steps

### Phase 1 — Survey

1. **Read the target brain file in full.** Note its current line count and how the Auto-updates section compares to other sections.
2. **Read `references/brain-file-architecture.md`** to refresh the four facts and the decision tree.
3. **Read the imported rules** (`.claude/rules/auto-updates.md`, any `@references/*` imports). They show what context the assistant sees on every session — duplicates between brain prose and imports indicate rot.

### Phase 2 — Classify each Auto-updates entry

For each entry in the `## Auto-updates` section, classify it into exactly one destination using the routing test:

**Destination A — Existing prose section in the same brain file.**
Symptoms: the entry's topic is already covered in a prose section (Pre-Task Gate, How to Operate, Browser Testing, Calendar Routing, etc.); or it's a procedural refinement of an existing section.
Action: fold the rule into the relevant prose, keeping the section coherent. Don't append a new bullet at the bottom of the section if the existing prose can absorb it.

**Destination B — Dedicated `## Section (Non-Negotiable)` gate.**
Symptoms: the entry describes a hard rule that must block action; multiple entries cluster around a single topic (e.g. several "always do X with Notion" rules); the rule needs a numbered checklist to be followed reliably.
Action: write a new gate section parallel to existing gates. Numbered list, blocking language ("Cannot report done while step N has not been performed"), title ends with `(Non-Negotiable)`.

**Destination C — `references/gotchas.md` (or assistant-specific reference).**
Symptoms: the entry is a tactical library quirk, environment-specific gotcha, or narrow tool fact (e.g. a CSS framework's cascade-layer behavior, a deploy platform's config flag, a third-party API's quirk).
Action: add a new subsection to `references/gotchas.md` with the library/tool/topic as the heading. Include code if relevant. Loads on demand.

**Destination D — `projects/<name>/context.md`.**
Symptoms: the entry is project-specific (a constraint, convention, or rule that only applies to one project).
Action: add a section to the project's context.md. Don't keep project-scoped knowledge in the assistant brain — it pollutes every other project's session.

**Destination E — A workflow file in `workflows/<assistant>/`.**
Symptoms: the entry describes a multi-step procedure or sequence of tool calls.
Action: extract the procedure into a workflow file. Reference it from the brain file's Tools and Workflows table.

**Destination F — A skill in `.claude/skills/`.**
Symptoms: the entry describes a reusable cognitive pattern triggered by specific keywords or actions.
Action: build a skill. The skill description triggers it automatically.

**Destination G — A hook in `.claude/settings.json`.**
Symptoms: the entry says something must run at a fixed lifecycle event ("before every commit", "after each file edit").
Action: write a hook. Brain rules cannot enforce mechanical events; hooks can.

**Destination H — Stays in Auto-updates.**
Symptoms: a genuine cross-cutting principle that applies across projects and sections, has no natural home elsewhere, and is small enough for one sentence.
Action: leave it. Be honest — most entries that "feel" like they belong here actually belong in A, B, or C.

**Destination I — Delete.**
Symptoms: the entry duplicates existing prose in the same brain file; the underlying fix lives in code; the rule no longer applies.
Action: delete.

### Phase 3 — Execute the migration

For each classified entry, in this order:

1. **Create or update the destination first** (the new reference doc, the new gate section, the workflow file, the project context). Verify the destination reads cleanly with the new content folded in.
2. **Remove the entry from `## Auto-updates`** in the brain file. Replace the entry list with a short migration note pointing at the new homes, so future audits know what happened.
3. **Verify the brain file's prose still reads coherently.** If a section got expanded, re-read it to ensure flow.
4. **Check imports.** If you moved content into a reference doc, verify the brain file imports it (or that the reference is loaded on demand and not at session start, depending on intent).

### Phase 4 — Verify

5. **Run `wc -l` on the audited brain file.** Confirm line count dropped and is now well under 200.
6. **Skim the file end-to-end.** Read it cold as if you were a fresh agent: do the rules now fire where the decisions happen? Are gates clearly blocking? Is Auto-updates intentionally small?
7. **Skim every section once.** Look for new conflicts the migration introduced — two prose sections saying overlapping things, a gate that now duplicates a rule in Continuous Self-Updating, etc. Fix any conflicts inline.

### Phase 5 — Commit

8. **Stage only the files this audit touched.** Never `git add -A`.
9. **Commit with scope tag.** For a single-assistant audit: `refactor(<assistant>): migrate Auto-updates to prose / gotchas / workflows`. For a system-wide audit: `refactor(system): brain-file architecture pass`.
10. **Push.**

### Phase 6 — Report

Tell the user: which file(s) audited, line-count delta, entries migrated and where, anything genuinely orphaned that stayed in Auto-updates (and why), and any follow-up audits identified.

## Red flags during audit

Stop and ask the user if any of these appear:

- A rule that contradicts an existing prose section — you need to know which is current
- An Auto-updates entry that references a project that no longer exists (might be archive material)
- A tactical fact that's already in `references/gotchas.md` (might be a copy that needs deletion vs the source of truth)
- A "stays in Auto-updates" classification that you can't justify in one sentence — usually means there's a better home you missed

## Anti-patterns

Don't:

- Add a new Auto-updates entry to "fix" a problem caused by Auto-updates bloat (adding a bullet to address bullet rot only deepens the rot)
- Leave a migration note longer than the original entries — that's just bullet rot wearing a hat
- Migrate without verifying the destination reads coherently afterward
- Skip the prune step at the end — that's where most of the per-session context win actually happens

## When audit ISN'T the answer

If the symptom is a SKILL not firing rather than a brain bullet not firing, audit the skill (description triggers, frontmatter, content), not the brain. The skill system handles its own loading separately from brain files.

If the symptom is a HOOK not firing, audit `.claude/settings.json`, not the brain.

If the symptom is "the user gave a one-off correction that doesn't need to persist", just fix the current session and move on — not every correction needs to become a rule.
