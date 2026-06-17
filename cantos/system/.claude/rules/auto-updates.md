# Auto-updates Format

Rules for what belongs in a brain file's `## Auto-updates` section. Applies to every assistant in the Cantos system.

**Read `references/brain-file-architecture.md` first** — it has the four governing facts from Anthropic's docs, the decision tree, and the rationale. This file is the operational checklist on top of it.

## The default is: don't add a bullet

Auto-updates is a tax. Every entry costs context tokens on every future session of that assistant. The docs are clear: longer brain files reduce adherence, vague rules get skipped, and conflicting rules get resolved arbitrarily. The mere fact that a lesson exists doesn't mean it belongs in Auto-updates.

Before appending anything, run the three-question routing test from `brain-file-architecture.md`:

1. **Does this lesson fit an existing prose section?** Edit the prose. No bullet.
2. **Does it need a dedicated gate?** Write a `## Section (Non-Negotiable)` block with a numbered checklist.
3. **Is it tactical or procedural?** Route to `references/gotchas.md`, a workflow, a skill, or a hook.

Only if all three return no — and the lesson is a genuine cross-cutting principle with no home — does it become an Auto-updates entry.

## Format

When an entry IS justified: one sentence, two lines maximum. Date prefix, then the rule as a direct instruction.

```
- [YYYY-MM-DD] <general principle — what to do, not the episode that taught it>
```

Good (rare, well-scoped):

```
- [2026-05-08] When the user shares a library or repo to learn from, capture it as a skill in `.claude/skills/`, not a reference doc.
```

Bad (episode narrative, multi-sentence, internal-debug detail):

```
- [2026-05-09] Today I was debugging a styling issue where my reset wasn't working...
```

Bad (tactical tidbit that belongs in `references/gotchas.md`):

```
- [2026-05-09] Tailwind v4 generates utilities inside cascade layers — never write un-layered global resets.
```

That tactical detail does not need to load on every session of every project; it loads when the assistant works on a Tailwind project.

## What does NOT belong in Auto-updates

| Type | Where it goes |
| --- | --- |
| Project-specific knowledge (selectors, file paths, internal APIs, library internals) | `projects/<name>/context.md` |
| Tactical library / tool quirks | `references/gotchas.md` (loaded on demand) |
| Multi-step procedures | `workflows/<assistant>/<name>.md` |
| Reusable cognitive patterns triggered by keywords | A skill in `.claude/skills/` |
| Mechanical events ("before every commit", "after each file edit") | A hook in `.claude/settings.json` |
| Structural rules that should block action | A `## Section (Non-Negotiable)` gate in the brain file |
| One-time decisions that affect direction | `decisions/log.md` |
| Debug episode narratives ("today I caught this when...") | The git commit message — not the brain file |

## Before adding an entry

1. Run the three-question test from `brain-file-architecture.md`. If any answer routes the lesson elsewhere, route it.
2. Check overlap with existing entries AND with prose in other sections. If something covers this already, edit the existing rule, don't add a new one.
3. Can it be expressed in one sentence as a direct instruction? If not, it's a workflow or skill, not a bullet.
4. Will it still apply six months from now? If it's tied to a specific debug episode, drop it — the fix lives in the code.

## Pruning

A clean Auto-updates section after a year should have FEWER entries than after a month, because accumulated lessons should be migrating into prose and workflows over time. Pruning is the back half of every wrap.

When the section approaches 10 entries, audit it:
- Collapse near-duplicates
- Demote tactical entries to `references/gotchas.md`
- Migrate any entry that has a natural prose home into that section
- Delete anything that no longer applies

The goal is a tight set of governing principles, not a chronological log.
