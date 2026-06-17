---
name: design-sub-agent
description: Use when planning, building, or auditing a sub-agent file. Guides frontmatter configuration, system prompt quality, and anti-pattern review before writing anything.
---

# Designing Sub-agents

A reasoning skill — no file writes. Think before you build.

Work through every question and checklist item before drafting anything. If any answer is "I'm not sure," resolve it first.

---

## When to Build a Sub-agent at All

Build a sub-agent when:

- The task produces verbose output you don't need in the main context (test runs, log processing, research)
- You want to enforce specific tool restrictions or permission modes
- The work is completely self-contained and can return a summary
- The same task type recurs across sessions and benefits from a persistent configuration

Don't build one when:

- The task fits in the current context window without quality loss
- The task needs frequent back-and-forth or iterative refinement with the user
- Multiple phases share significant context — sub-agents start fresh each time
- A skill would work — skills run in the main conversation context and are simpler

Check `registry/index.md` first. If something covers 80%+ of this task, extend that instead.

**Critical constraint:** Sub-agents cannot spawn other sub-agents. If a workflow requires nested delegation, chain sub-agents from the main conversation or use skills.

---

## Frontmatter Fields — Complete Reference

Sub-agent files use YAML frontmatter for configuration. The markdown body after the frontmatter becomes the system prompt. Only `name` and `description` are required.

```yaml
---
name: my-agent           # Required. Lowercase, hyphens only.
description: ...         # Required. When Claude should delegate here.
tools: Read, Glob, Bash  # Optional. Allowlist — only these tools. Omit to inherit all.
disallowedTools: Write   # Optional. Denylist — removes from inherited set.
model: haiku             # Optional. haiku | sonnet | opus | inherit (default)
permissionMode: auto     # Optional. default | acceptEdits | auto | dontAsk | bypassPermissions | plan
maxTurns: 20             # Optional. Cap on agentic turns before stopping.
memory: project          # Optional. user | project | local — enables persistent memory.
skills:                  # Optional. Preload skill content into context at startup.
  - skill-name
background: true         # Optional. Always run as background task.
mcpServers:              # Optional. MCP servers scoped to this sub-agent only.
  - server-name
isolation: worktree      # Optional. Give sub-agent isolated git worktree copy.
---

System prompt body goes here.
```

**If both `tools` and `disallowedTools` are set:** `disallowedTools` is applied first, then `tools` resolves against what remains. A tool in both is removed.

---

## Self-interrogation Questions

Answer all of these before writing a single line of the sub-agent file.

### Identity and scope

- What is the single task this sub-agent does? State it in one sentence with no "and also."
- Is the body self-contained? Sub-agents receive ONLY their system prompt — no CLAUDE.md, no parent context, no registry knowledge. Everything it needs must be in the body or discoverable via its tools.
- Is this genuinely too complex for the current context window, or am I splitting unnecessarily?

### Inputs and output

- What exact files or data does it receive? (paths, formats — not "receives context")
- What exactly does it produce? (exact file path, exact format, or "nothing — reasoning only")

### Rules and constraints

- What specific rules does it operate under? List them — not "follows MLA" but actual checkable rules.
- What does it explicitly NOT do? This is as important as what it does.

### Failure modes

- What happens if an input is missing or malformed?
- What happens if it can't complete the task?

---

## Frontmatter Design Decisions

### Description — most important field after name

Claude uses `description` to decide when to auto-delegate. Write it as a trigger condition, not a feature summary.

- Bad: "Handles Google Calendar events"
- Good: "Handles all Google Calendar write operations — creating events with deduplication. Use when any workflow needs to add events to the user's calendar."

Add "Use proactively" if you want Claude to delegate without being asked.

### Model selection

| Model | Use when |
| --- | --- |
| `haiku` | Data collection, simple lookups, deterministic tasks, checklist execution |
| `sonnet` | Reasoning, analysis, judgment calls, generating structured output |
| `opus` | Complex multi-step reasoning where quality matters more than speed |
| `inherit` | Default — uses whatever model the main conversation uses |

Match the model to the cognitive load. Haiku for gathering, Sonnet for analyzing.

### Tools — principle of least privilege

Grant only what the sub-agent actually needs.

**Prefer `tools` (allowlist)** — explicit, self-documenting, immune to future tools being added. Use this for most sub-agents.

```yaml
tools: Read, Glob, Bash   # Only these — can't write files, can't use MCP
```

**Use `disallowedTools` (denylist) only** when you need to inherit most tools (including all MCP servers) but block a few specific ones:

```yaml
disallowedTools: Write, Edit   # Inherits everything else including MCP
```

**Common patterns:**

- Read-only researcher: `tools: Read, Glob, Grep, Bash`
- MCP-only (no file ops): `disallowedTools: Read, Write, Edit, Bash, Glob, Grep`
- Pure reasoning (receives all data in prompt): `tools: Read, Grep, Glob`
- Browser automation: `tools: Bash` (playwright-cli runs via Bash)

### Memory — when to add it

Memory gives the sub-agent a persistent directory that survives across conversations. It builds up knowledge over time.

**Enable memory when:** the sub-agent benefits from accumulating patterns, conventions, or domain knowledge (site-specific bot detection, recurring citation errors, audit trend patterns).

**Do not enable memory when:** the sub-agent is purely stateless (calendar event creation, data formatting, one-time tasks).

| Scope | Location | Use when |
| --- | --- | --- |
| `user` | `~/.claude/agent-memory/<name>/` | Knowledge applies across all projects |
| `project` | `.claude/agent-memory/<name>/` | Knowledge is project-specific, shareable via git |
| `local` | `.claude/agent-memory-local/<name>/` | Project-specific but not committed |

Default to `project` unless the knowledge is clearly cross-project.

**When memory is enabled:** `Read`, `Write`, and `Edit` are automatically added to the sub-agent's tools. Don't add `memory` to a sub-agent that must be read-only.

Include memory instructions in the body:

```markdown
Before starting, read your memory for patterns relevant to this task.
After completing, update your memory with anything new you learned.
```

### Skills preloading

Use `skills` to inject skill content into the sub-agent's context at startup. Sub-agents do NOT inherit skills from the parent conversation — you must list them explicitly.

```yaml
skills:
  - mla-citation-rules
  - ai-detect
```

Use this when the sub-agent needs domain knowledge that's already captured in a skill file, rather than duplicating it in the sub-agent body.

### permissionMode

Only set this if the sub-agent needs a different permission behavior than the main conversation.

- `acceptEdits` — auto-accept file edits. Use for sub-agents that write output files frequently.
- `auto` — background classifier reviews commands. Use for sub-agents with broad tool access.
- `bypassPermissions` — skips all prompts. Use only for fully trusted, well-scoped sub-agents.
- `plan` — read-only exploration mode.

### background

Set `background: true` if this sub-agent is always appropriate to run concurrently (e.g., a long-running browser task or test runner). Claude will still decide per-invocation otherwise.

---

## Quality Checklist

Evaluate the draft against every item before writing the file.

- [ ] `name` — lowercase, hyphens only, unique
- [ ] `description` — written as a delegation trigger, not a feature description
- [ ] Model matches cognitive load (haiku for data, sonnet for reasoning)
- [ ] Tools follow least privilege — only what's actually needed
- [ ] Memory enabled if sub-agent benefits from cross-session learning
- [ ] Body is fully self-contained — assumes no parent context, no CLAUDE.md
- [ ] Single responsibility — one task, stated in one sentence
- [ ] Inputs are explicit — no ambiguity about what it receives
- [ ] Output is explicit — exact file path and format, or "none"
- [ ] Rules are specific — numbered, checkable, not vague guidance
- [ ] "Does not" section exists — scope is bounded
- [ ] Failure handling defined
- [ ] No duplication — registry was checked before building
- [ ] Symlink added to `.claude/agents/` if it's in `.assistants/*/sub-agents/`

---

## Anti-patterns to Reject

- **Too broad** — "general reviewer" or "research helper" → split into one specific task
- **Inputs undefined** — "receives relevant context" → specify exactly what files or data
- **Output vague** — "reports issues" → specify the exact file path and format
- **Rules implicit** — "follows best practices" → list each rule as a numbered, checkable item
- **Body assumes parent context** — the sub-agent receives ONLY its system prompt; don't reference CLAUDE.md conventions or registry knowledge without having the sub-agent read those files itself
- **Wrong model** — don't use Sonnet for pure data collection; don't use Haiku for complex reasoning
- **Memory on read-only agent** — memory auto-enables Write/Edit; don't add it to agents that must stay read-only
- **Same as existing** — if a registry sub-agent covers 80%+ of this, extend that one instead

---

## File Location

Sub-agent files belong in `.assistants/<owner>/sub-agents/<name>.md`. After creating, add a symlink to `.claude/agents/<name>.md` for native Claude Code auto-discovery:

```bash
cd .claude/agents
ln -s ../../.assistants/<owner>/sub-agents/<file>.md <name>.md
```

Register in `registry/index.md` immediately.

---

## Self-Improvement

When the user gives feedback on a sub-agent output (missed scope, wrong model, vague rules), trace it back to which question or checklist item failed to catch it. Update that item here immediately.

Do not store sub-agent design conventions in individual assistant files — update this skill.
