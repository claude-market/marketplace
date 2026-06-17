# Document Best Practices

Reference this file when drafting any instruction document in the Cantos system — skills, workflows, assistant brain files, sub-agent files, or templates.

Source: [Anthropic Agent Skills Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

---

## YAML Frontmatter (skills, and named-agent sub-agents)

Two file types require YAML frontmatter as the first block; the Claude Code harness parses it, so it is a system requirement, not a stylistic choice:

- **Skills** in `.claude/skills/` — the system parses `name` and `description` to know when to trigger the skill.
- **Named-agent sub-agents** — a sub-agent dispatched by name via the Task tool (symlinked into `.claude/agents/`) needs frontmatter (`name`, `description`, and `tools`/`model`) so the harness can register and dispatch it. Without frontmatter it is documented but uncallable. See `.claude/rules/sub-agents.md` for the two dispatch models.

Plain markdown (no frontmatter): workflows, brain files, reference docs, and **prose-template sub-agents** — a sub-agent spawned by reading its content into a Task brief by absolute path, not by name. For those files frontmatter would be decorative; no system reads it, so don't add it.

```yaml
---
name: gerund-form-name
description: Third-person description of what this skill (or named-agent sub-agent) does and when to use it. Specific enough to distinguish it from others.
trigger: Optional (skills) — describe what user messages or contexts should activate this skill.
# Named-agent sub-agents add tools/model instead of trigger:
# tools: Read, Grep, Glob
# model: haiku
---
```

**Name rules:**

- Gerund form preferred: `designing-sub-agents`, `evaluating-arguments`, `critiquing-writing`
- Lowercase letters, numbers, hyphens only
- Max 64 characters
- No vague names: `helper`, `utils`, `tools`

**Description rules:**

- Always third person — "Guides the assistant through..." not "Use this to..."
- Must include: what it does + when to use it
- Max 1024 characters
- Specific: name the domain, the context, the trigger

**Examples:**

Good:

```yaml
description: Guides the assistant through self-interrogation questions and quality checks before building a sub-agent. Use when any assistant is about to create a new sub-agent file.
```

Bad:

```yaml
description: Helps with sub-agents
```

---

## Conciseness

Context is shared. Every token in an instruction file competes with conversation history, project files, and the user's actual request.

**Default assumption: Claude is already smart.** Only add what Claude doesn't already know.

Before including any paragraph or section, ask:

- Does Claude need this, or does it already know it?
- Can I cut this and still get the same behavior?
- Does this justify its token cost?

**Good — concise:**

```markdown
## Check for duplicates
Read `registry/index.md`. If a sub-agent already covers this task, extend it rather than creating a new file.
```

**Bad — verbose:**

```markdown
## Checking the registry for duplicate sub-agents
Before creating any new sub-agent, it's important to check whether an equivalent sub-agent already exists in the system. The registry is located at `registry/index.md` and contains a list of all sub-agents that have been created. You should open this file and read through the sub-agents section to see if any existing sub-agent covers the same task or a very similar task. If you find one that does, you should extend that sub-agent rather than creating a new one, as this prevents duplication...
```

---

## Degrees of Freedom

Match instruction specificity to how fragile the task is.

| Task type | Use | Example |
| --- | --- | --- |
| Fragile, must be exact | Low freedom — specific steps, exact commands | Database migrations, citation formatting |
| Some variation acceptable | Medium freedom — pseudocode or template with parameters | Report generation, source discovery |
| Many valid approaches | High freedom — principles and heuristics | Code review, argument evaluation |

Don't over-constrain tasks that don't need it. Don't under-constrain tasks that break if done wrong.

---

## Progressive Disclosure

Keep the main file lean. Move detail into sub-files that are loaded only when needed.

- Main skill or workflow file: overview, quick reference, pointers to sub-files
- Sub-files: complete rules, extended examples, reference material

For example, a main file can point to its sub-files like this (the filenames are illustrative, not files that ship with the template):

```markdown
## Advanced formatting rules

For journal articles: see `references/mla-journal-rules.md`
For webpages: see `references/mla-webpage-rules.md`
```

Claude reads sub-files only when the task requires them. This keeps token usage low for simple cases.

**Keep references one level deep.** Avoid chaining: `SKILL.md → advanced.md → details.md`. Claude may only partially read nested references. Everything should link directly from the main file.

**File size target:** Keep instruction files under 500 lines. If a file is approaching this, split content into referenced sub-files.

---

## Consistent Terminology

Pick one term for each concept and use it everywhere in the file. Inconsistency causes Claude to treat terms as distinct concepts.

Good — consistent:

- Always "sub-agent", never "subprocess" or "helper agent"
- Always "brain file", never "instruction file" or "config"
- Always "registry", never "index" or "lookup table"

Bad — inconsistent:

- "sub-agent" in one section, "helper" in another, "subprocess" in a third

---

## Workflow Checklists

For multi-step workflows, provide a checklist Claude can track. This prevents skipping steps and makes progress visible.

```markdown
## Checklist
- [ ] Step 1: Check registry for duplicates
- [ ] Step 2: Load design skill and answer all questions
- [ ] Step 3: Draft the file
- [ ] Step 4: Self-review against quality checklist
- [ ] Step 5: Write the file
- [ ] Step 6: Update registry
- [ ] Step 7: Improve this workflow
```

---

## Feedback Loops

For quality-critical tasks, build in a validate → fix → repeat loop. Don't assume the first pass is correct.

```markdown
1. Run the validator
2. If issues found: fix them, return to step 1
3. Only proceed when validation passes
```

This applies to: citation generation, DOCX formatting, argument review, any task where errors compound.

---

## Examples Pattern

For tasks where output quality depends on format or style, provide concrete input/output pairs — not just descriptions.

```markdown
**Example — source citation:**
Input: Acemoglu, D. (2021). Harms of AI. NBER Working Paper.
Output (MLA 9): Acemoglu, Daron. "Harms of AI." *NBER Working Paper No. 29247*, National Bureau of Economic Research, Sept. 2021, www.nber.org/papers/w29247.
```

Examples outperform rules for style and format tasks.

---

## No Time-Sensitive Information

Don't embed dates or version conditions as primary content. They become wrong and silently mislead.

Bad:

```markdown
Before April 2026, use the old format. After April 2026, use the new one.
```

Good:

```markdown
## Current format
[current approach]

## Old format (deprecated)
[prior approach — for reference only]
```

---

## File Naming

- Descriptive names: `mla-journal-rules.md`, not `doc2.md`
- Lowercase with hyphens: `design-sub-agent.md`, not `DesignSubAgent.md`
- Forward slashes only in paths: `references/mla-rules.md`, never backslashes

---

## Self-Improvement

Every instruction file should get better through use. When a file is used and produces a suboptimal result, update it immediately. Don't carry mental notes.

- Skills: update when self-interrogation questions prove insufficient
- Workflows: update after every run (see Step 7 pattern in workflows)
- Brain files: update when new operating patterns are established
- Sub-agents: update on any error or correction

---

## Quick Checklist

Before finalizing any instruction document:

- [ ] YAML frontmatter included (skills and named-agent sub-agents) — name in gerund form, description in third person; sub-agents add `tools`/`model`
- [ ] Concise — no explanations Claude doesn't need
- [ ] Degrees of freedom match task fragility
- [ ] Terminology consistent throughout
- [ ] References one level deep (no nesting)
- [ ] File under 500 lines, or split into sub-files
- [ ] No time-sensitive content
- [ ] Feedback loop included (if quality-critical)
- [ ] Self-improvement mechanism present
- [ ] Examples provided (if output format matters)
