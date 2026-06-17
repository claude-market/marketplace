# Brain File Architecture

How instruction files (CLAUDE.md, assistant brain files, rules, skills, workflows, references) work in the Cantos system, and how to keep them effective. Cantos is the system expert on this — every assistant defers to Cantos when deciding where a new piece of knowledge belongs.

This doc is grounded in Anthropic's official Claude Code memory guidance (`docs.anthropic.com/en/docs/claude-code/memory`). The key facts there drive every decision below.

## The four facts that govern everything

1. **Instructions are context, not enforcement.** "CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself. Claude reads it and tries to follow it, but there's no guarantee of strict compliance, especially for vague or conflicting instructions." Adding rules makes them visible — it does not make them binding.
2. **Length kills adherence.** "Target under 200 lines per CLAUDE.md file. Longer files consume more context and reduce adherence." This is a hard ceiling, not a guideline.
3. **Vague rules fail.** "'Use 2-space indentation' works better than 'format code nicely.'" Generic principles ("be careful", "iterate") get skipped. Concrete, verifiable instructions get followed.
4. **Conflicts get resolved arbitrarily.** "If two rules contradict each other, Claude may pick one arbitrarily." Two bullets saying overlapping things produce worse behavior than one well-written rule in the right section.

## Step 0 — Generalize to the class (do this before routing)

The decision tree below routes *where a lesson lives*. It does not ask *whether the lesson is the general principle or just one instance of it*. That question comes first, because routing a narrow fix to its proper home is still a narrow fix.

Before running the routing test on any finding, abstract it:

1. **Name the class.** State the specific incident in one line, then ask: "what is the general category of problem this is one instance of?" ("This Tailwind reset broke because it was un-layered" → the class is "un-layered global CSS silently overrides framework utilities.")
2. **Find the broadest correct fix.** What single change prevents the *entire class* from recurring, not just this instance — a gate that blocks the bad action, a workflow step that makes the right thing automatic, a tool that removes the failure mode, or a prose rule that names the principle? ("Always write resets inside `@layer base`" prevents every instance, not just this file.)
3. **Route the generalized fix, not the episode.** Take the class-level fix into the decision tree below. Never record the specific episode when a wholistic patch to its class is within reach — the episode belongs in the commit message; the principle belongs in the system.

A correction is rarely about the one thing that happened. It is almost always evidence of a class of thing the system lets happen. Patch the class.

## The decision tree: where does new knowledge go?

When a session surfaces a lesson — the user gave a correction, the assistant made a mistake, a new pattern emerged — Cantos (and every assistant on wrap) runs this routing test BEFORE writing anything:

1. **Does this lesson fit an existing prose section in the brain file?**
   - Yes → edit the prose. Don't add a bullet.
   - The bullet at the bottom of the file reads as trivia. The same lesson woven into the section where the decision actually happens reads as a rule.
   - Example: a worktree-merge lesson belongs in the Pre-Task Gate or `consolidate_worktrees.md` workflow, not in Auto-updates.

2. **Is it a structural rule that needs a dedicated gate?**
   - Yes → create a `## Section (Non-Negotiable)` block with a numbered checklist, parallel to existing gates like Pre-Task Gate or Visual Verification Gate.
   - Gates work because they're scannable, blocking, and impossible to read past. Bullets aren't.

3. **Is it a tactical tidbit — a specific library, narrow tool quirk, or environment-specific gotcha?**
   - Yes → `references/gotchas.md` (loaded on demand, not at session start). Skill or workflow if the knowledge is procedural.
   - These don't belong in the brain because they don't fire on every session.

4. **Is it a hard mechanical event ("before every commit", "after each file edit")?**
   - Yes → write a hook in `.claude/settings.json`. Hooks execute deterministically; brain rules don't.

5. **Is it a multi-step procedure?**
   - Yes → workflow file in `workflows/<assistant>/` or a skill in `.claude/skills/`. Brain bullets can't carry procedures.

6. **None of the above — genuine cross-cutting principle?**
   - Then and only then: brain file `## Auto-updates`. Use sparingly. Treat it as a last resort.

## Auto-updates is a last resort, not a default

Auto-updates was originally meant for general behavioral rules. In practice it gets used as a chronological log of past incidents — every wrap appends another bullet describing what went wrong this session. This is the failure mode. The docs are explicit that long brain files reduce adherence and that vague bullets get skipped.

Symptoms of an Auto-updates that has rotted into a log:
- Entries describe an episode ("today I discovered X") instead of a principle ("when X, do Y")
- Entries duplicate prose rules already in the file
- Entries are tactical (specific library, specific bug) rather than cross-cutting
- The section has more than ~10 entries
- Entries are sorted by date rather than grouped by topic

When any of these are true, the right move is migration, not appending. Walk each entry through the decision tree above and route it to its proper home.

## What gates look like vs what auto-updates look like

A gate (good for behavior):

```markdown
## Visual Verification Gate (Non-Negotiable)

**Applies to every UI task where a reference image is in scope.**

1. List every reference image in scope.
2. `git mv` any loose reference into `projects/<name>/inspiration/`.
3. Playwright-screenshot the current build.
4. Read reference + screenshot in the same response, list the deltas.
5. Cannot report done while step 4 has not been performed.
```

An auto-update bullet (much weaker, easy to skip):

```markdown
- [2026-05-14] When a reference image is in scope for a UI task, hard-gate "done" on a side-by-side compare loop.
```

Both say the same thing. Only the gate blocks action. The bullet rots into trivia.

## When auto-updates IS the right call

A rule belongs in Auto-updates only when ALL of these are true:
- It's a cross-cutting principle that applies across projects and across sections of work
- It doesn't have a natural home in any existing prose section
- It's small enough to express in one sentence as a direct instruction
- It will still apply six months from now
- It doesn't overlap with anything else in the file

If any of those is false, route it through the decision tree.

## On wrap

Every `/wrap` runs the decision tree on every candidate lesson before any append. The wrap skill should refuse to add an Auto-updates bullet without first asking the three questions:

1. Does this update existing prose? (If yes, edit the prose.)
2. Does this need a new dedicated section? (If yes, write a gate.)
3. Is this tactical or procedural? (If yes, route to gotchas / workflow / skill.)

Only after all three return no does Auto-updates get a new entry — and even then, the wrap should propose the entry and check for overlap with what's already there.

## Pruning is part of editing

"Whenever an entry is added, scan the existing list for overlaps and merge. When the section approaches 15 entries, audit it." Pruning isn't an occasional cleanup — it's the back half of every wrap. The forward half is "what's new?"; the back half is "what's now redundant?"

A clean Auto-updates section after a year of work should have FEWER entries than after a month, not more. The mass of accumulated lessons should be migrating into prose and workflows over time, not piling up in the bullet list.

## Why this matters for the Cantos system

Every assistant's brain file is loaded on every morph. CLAUDE.md is loaded on every session. Every byte spent on a stale bullet is a byte that could have been spent on the current task. The cost is invisible per-bullet and crushing per-session over time.

Cantos's job as system expert: make sure the system stays lean. Audit brain files when patterns suggest rot. Migrate aggressively. Default to prose. Treat Auto-updates as a tax to be paid only when no other vehicle fits.
