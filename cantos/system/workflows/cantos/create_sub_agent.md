# Workflow: Create Sub-agent

**Owner:** Cantos
**Accessible by:** All assistants
**References:** `references/doc-best-practices.md` — apply these conventions when drafting the sub-agent file
**Objective:** Produce a single, high-quality, registry-registered sub-agent `.md` file on the first attempt.

All design questions are answered by the assistant itself — this is internal tooling, not a user interview.

---

## Inputs

- The task or problem that requires a sub-agent (identified by the calling assistant)

## Outputs

- `.assistants/<owner>/sub-agents/<name>.md` — sub-agent file
- `registry/index.md` — updated with new sub-agent row

---

## Steps

### Step 1 — Check the registry

Read `registry/index.md` under Sub-agents.

- If a sub-agent already covers this task or 80%+ of it, extend that one instead of creating a new file
- If clear: proceed to Step 2

---

### Step 2 — Load the design skill

Load the `design-sub-agent` skill (`.claude/skills/design-sub-agent/SKILL.md`) and work through every self-interrogation question. Write answers as scratch notes — do not skip any question.

If any answer is "I'm not sure," resolve it before moving on. Do not draft until all questions are answered.

---

### Step 3 — Draft the sub-agent

Use `.claude/templates/sub-agents/sub_agent_template.md` as the base. Fill in every section from the scratch notes in Step 2. Leave no placeholder text.

---

### Step 4 — Self-review against quality checklist

Run through every item in the skill's quality checklist. If any item fails, fix the draft. Do not write a file that fails the checklist.

---

### Step 5 — Write the file

Write to `.assistants/<owner>/sub-agents/<name>.md`. The owning assistant is whoever is running this workflow.

---

### Step 5b — Make it dispatchable (decide the dispatch model)

Cantos sub-agents use one of two dispatch models. Decide which applies before registering:

- **Named Claude Code agent** — the file has YAML frontmatter (`name`, `description`, `tools`/`model`) and is meant to be spawned by name via the Task tool (e.g. the folio writing-* agents, the system-audit pair). These are dispatchable ONLY if a symlink exists in `.claude/agents/`; without it the agent is documented-but-uncallable. Create the symlink:

  ```bash
  ln -s ../../.assistants/<owner>/sub-agents/<filename>.md .claude/agents/<hyphenated-name>.md
  ```

  The symlink filename is the agent's `name` field, hyphenated; it points at the source file (which may use an underscore). Verify with `ls -la .claude/agents/<hyphenated-name>.md`, then `git add` it.
- **Prose prompt-template sub-agent** — no frontmatter; spawned by reading the file's content into a Task brief by absolute path (e.g. pylon's `website-builder`). No symlink, `Symlinked = N`.

The registry's `Symlinked` column must match reality — `Y` only if the symlink exists on disk.

---

### Step 6 — Update registry

Add to `registry/index.md` under Sub-agents (match the table's existing columns, including `Symlinked`):

```
| <name> | `.assistants/<owner>/sub-agents/<name>.md` | <owner> | <all or specific assistant> | <Y/N> |
```

Set `accessible by` to `all` if any other assistant could plausibly use it. Set `Symlinked` to `Y` only if you created the `.claude/agents/` symlink in Step 5b.

---

### Step 6b — Update the owning assistant's brain file

Open `.assistants/<owner>/<owner>.md` and add a row to the Sub-agents table:

```
| <name> | `.assistants/<owner>/sub-agents/<name>.md` | <one-line purpose> |
```

If the brain file has no Sub-agents table yet, add one under a `## Sub-agents` heading.

**This step is mandatory.** The registry is a system-wide lookup; the brain file is the assistant's working context. Both must stay in sync. Skipping this is the primary cause of brain files going stale.

---

### Step 7 — Improve this workflow

After every run, before closing:

- Did the sub-agent work correctly on first invocation? If not — what self-interrogation question in Step 2 would have caught the issue? Add or sharpen that question in the skill file.
- Did the quality checklist miss a failure mode? Add it to the skill.
- Did the template produce a section that wasn't useful? Remove it from the template.
- Was anything in these steps ambiguous? Fix it here.

This step is the mechanism by which first-attempt quality improves over time. Every run makes the next run better. Do not skip it.

---

## Edge Cases

- **Scope unclear** — re-run the single-responsibility question; if the task can't be stated in one sentence, the sub-agent is too broad; split or narrow before proceeding
- **Inputs unclear** — trace the exact caller: what files does the calling workflow or assistant produce that this sub-agent will receive?
- **Duplicate detected** — extend existing sub-agent rather than creating a new one; update its registry row if scope expands
- **Rules too vague** — write each rule as a numbered checklist item that can be mechanically checked; if you can't do that, the rule isn't specific enough yet
- **Failure handling unclear** — for each input, ask: what if this is missing or malformed? Document the answer in the Failure Handling section
