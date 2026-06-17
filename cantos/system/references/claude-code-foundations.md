# Claude Code Foundations

Distilled facts from Anthropic's official Claude Code documentation. Cantos and every assistant build on top of this. When the Cantos system diverges from these facts, the divergence must be intentional and documented.

Source pages (load on demand if a question gets specific):

- [Memory / CLAUDE.md](https://code.claude.com/docs/en/memory)
- [Skills](https://code.claude.com/docs/en/skills)
- [Sub-agents](https://code.claude.com/docs/en/sub-agents)
- [Hooks guide](https://code.claude.com/docs/en/hooks-guide)
- [Best practices](https://code.claude.com/docs/en/best-practices)
- [Context window](https://code.claude.com/docs/en/context-window)
- [.claude directory](https://code.claude.com/docs/en/claude-directory)
- [Settings](https://code.claude.com/docs/en/settings)

---

## 1. The one constraint that drives everything

> "Most best practices are based on one constraint: Claude's context window fills up fast, and performance degrades as it fills." — *Best Practices*

Every architectural decision in the Cantos system has to defend itself against this. If a file is loaded on every session, every byte costs. If a file loads on demand, the cost is paid only when relevant. Skills, references, gotchas, and project context exist because of this constraint.

---

## 2. CLAUDE.md — the rules

What it is, in Anthropic's words:

> "CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself. Claude reads it and tries to follow it, but there's no guarantee of strict compliance, especially for vague or conflicting instructions."

The four rules:

1. **Under 200 lines.** "Longer files consume more context and reduce adherence."
2. **Specific, not vague.** "'Use 2-space indentation' works better than 'format code nicely.'"
3. **Conflicts get resolved arbitrarily.** Two rules saying overlapping things produce worse behavior than one well-placed rule.
4. **Emphasis tunes adherence.** "IMPORTANT" or "YOU MUST" actually moves the needle.

Anthropic's include/exclude table (verbatim):

| ✅ Include | ❌ Exclude |
| --- | --- |
| Bash commands Claude can't guess | Anything Claude can figure out by reading code |
| Code style rules that differ from defaults | Standard language conventions Claude already knows |
| Testing instructions and preferred test runners | Detailed API documentation (link to docs instead) |
| Repository etiquette (branch naming, PR conventions) | Information that changes frequently |
| Architectural decisions specific to your project | Long explanations or tutorials |
| Developer environment quirks (required env vars) | File-by-file descriptions of the codebase |
| Common gotchas or non-obvious behaviors | Self-evident practices like "write clean code" |

Pruning test: "Would removing this cause Claude to make mistakes?" If not, cut it.

CLAUDE.md @-imports load at session start alongside the parent file. They count toward context cost. Use them for organization, not size reduction — split into skills if you need true on-demand loading.

---

## 3. Skills — the lightweight on-demand vehicle

> "Create a skill when you keep pasting the same instructions, checklist, or multi-step procedure into chat, or when a section of CLAUDE.md has grown into a procedure rather than a fact. Unlike CLAUDE.md content, a skill's body loads only when it's used, so long reference material costs almost nothing until you need it." — *Skills*

Mechanics:

- A skill is `.claude/skills/<name>/SKILL.md`. Directory name becomes the slash command.
- Only the `description` (capped at 1,536 chars) auto-loads at session start. Full content loads on invocation.
- After invocation, the skill content stays in conversation for the rest of the session.
- "Keep `SKILL.md` under 500 lines. Move detailed reference material to separate files."
- `disable-model-invocation: true` → only user can invoke (good for side-effect commands like `/deploy`).
- `user-invocable: false` → only Claude can auto-invoke (good for background-knowledge skills like `/legacy-system-context`).
- `paths: ["src/api/**"]` → only loaded when matching files in scope.
- `allowed-tools` → grants tool permissions while the skill is active.
- `context: fork` + `agent: <type>` → run the skill inside an isolated subagent.

Anti-patterns:

- Skills that contain reference material that the assistant should always know → that belongs in CLAUDE.md or a brain file.
- Bloated SKILL.md bodies → once invoked they're in context forever. Split into supporting files referenced from SKILL.md.
- Vague descriptions → Claude won't know when to trigger. Front-load the key trigger phrase.

---

## 4. Sub-agents — isolated context windows

> "Use one when a side task would flood your main conversation with search results, logs, or file contents you won't reference again: the subagent does that work in its own context and returns only the summary." — *Sub-agents*

Mechanics:

- Native location: `.claude/agents/<name>.md` (or `.assistants/<owner>/sub-agents/<name>.md` in our orchestrator pattern).
- Each runs in its own context window with a custom system prompt and tool whitelist.
- Description determines auto-invocation; the body is the system prompt the sub-agent uses.
- Per-subagent auto-memory lives at `.claude/agent-memory/<sub-agent-name>/MEMORY.md` and is loaded when that sub-agent runs.

When to spawn one:

- The task would otherwise dump heavy artifacts (logs, search dumps, transcripts) into the main conversation.
- The task benefits from a narrow tool whitelist or a cheaper model (Haiku for read-only research).
- The task needs to run in isolation (worktree, sandbox).

Cost-control hint: route read-heavy research to Haiku-backed sub-agents. The main conversation only sees the summary.

---

## 5. Hooks — the only enforcement mechanism

> "Unlike CLAUDE.md instructions which are advisory, hooks are deterministic and guarantee the action happens." — *Hooks guide*

Hooks are shell commands run by the harness at fixed lifecycle events:

- `PreToolUse` — before a tool runs (can block by exiting non-zero)
- `PostToolUse` — after a tool runs (run linter after Edit/Write, log audit trail)
- `Stop` — when the session ends
- `SessionStart` — when a session begins (inject context, set up environment)
- `WorktreeCreate` — when a new worktree is provisioned
- `InstructionsLoaded` — fires after CLAUDE.md and rules load (useful for debugging which files loaded)

When to use a hook (instead of a brain rule or skill):

- Must happen every time, with zero exceptions ("run prettier on every edited file", "lint before commit")
- Mechanical, not judgmental (no LLM decision required)
- Should fire whether the model chose to or not

When NOT to use a hook:

- The action requires judgment ("decide if this change deserves a test") — that's a skill or sub-agent
- The action is rare or context-dependent — that's a workflow

Configuration lives in `.claude/settings.json` under the `hooks` key. Use `update-config` skill to edit safely.

---

## 6. Settings — the only thing that's truly enforced

> "Settings... enforced whether Claude follows them or not." — *.claude directory*

The split:

| Concern | Vehicle |
| --- | --- |
| Behavioral guidance (style, conventions) | CLAUDE.md, brain files, skills |
| Mechanical enforcement (block tools, force lint) | `.claude/settings.json` |

Key keys in `settings.json`:

- `permissions.allow` / `permissions.deny` — tool/Bash command allowlists/blocklists
- `hooks` — lifecycle scripts (see Section 5)
- `statusLine` — bottom-of-screen indicator
- `model` — default model for the project
- `env` — environment variables in every session
- `outputStyle` — system-prompt style override
- `autoMemoryEnabled` — true/false for auto memory (Cantos sets this to `false`)
- `skillOverrides` — per-skill visibility (`"on"`, `"name-only"`, `"user-invocable-only"`, `"off"`)
- `claudeMdExcludes` — paths to skip when discovering CLAUDE.md files

Layer precedence (highest wins): managed > local > project > user.

---

## 7. Rules — topic-scoped or path-scoped instructions

Per Anthropic:

> "Rules without `paths:` frontmatter are loaded unconditionally and apply to all files. Path-scoped rules trigger when Claude reads files matching the pattern, not on every tool use."

Mechanics:

- `.claude/rules/*.md` — all `.md` files discovered recursively
- Without `paths:` → loads at session start, same priority as CLAUDE.md
- With `paths: [glob, glob]` → loads when a matching file enters context (Claude reads it)
- Subdirectories work — `.claude/rules/frontend/react.md` is auto-discovered

When to use rules (vs CLAUDE.md):

- The instruction only applies to a slice of the codebase (use `paths:`)
- The CLAUDE.md is hitting the 200-line ceiling and content can be path-scoped
- Multiple topics need their own files for editing convenience

When NOT to use rules:

- The instruction applies globally and there's no advantage to a separate file → put it in CLAUDE.md
- The instruction is a multi-step procedure → that's a skill or workflow

**Trap:** if you put a rules file in `.claude/rules/` AND @-import it from CLAUDE.md, the content loads twice. Either rely on `.claude/rules/` auto-loading OR @-import from a different location — never both.

---

## 8. The .claude/ directory — official layout

| Path | Purpose | Auto-loaded? |
| --- | --- | --- |
| `.claude/settings.json` | Permissions, hooks, model, env (enforced) | Always (read by harness) |
| `.claude/settings.local.json` | Personal overrides, gitignored | Always |
| `.claude/rules/` | Topic-scoped or path-scoped instructions | Session start (unconditional rules) or on file read (path-scoped) |
| `.claude/skills/` | Slash-commandable skills | Description always; body on invocation |
| `.claude/agents/` | Custom sub-agents | Description always; body when spawned |
| `.claude/agent-memory/<name>/` | Per-subagent auto-memory (MEMORY.md + topic files) | When that sub-agent runs |
| `.claude/commands/` | Legacy single-file slash commands | Description always; body on invocation. Skills supersede. |
| `.claude/output-styles/` | System prompt styles | When selected via `outputStyle` setting |
| `.claude/worktrees/` | Worktree-related data | N/A (harness uses) |
| `.mcp.json` *(at project root, not .claude/)* | Project-scoped MCP servers (optional — not shipped; create one only if you want to connect servers) | Connect at session start; tool schemas deferred |
| `.worktreeinclude` *(at project root)* | Gitignored files to copy into worktrees | On worktree create |

---

## 9. The decision tree for new knowledge

> Where does a new lesson, rule, or piece of knowledge belong?

```
Is it something that MUST happen mechanically every time?
  → Hook in `.claude/settings.json`

Is it a multi-step procedure or cognitive pattern triggered by keywords?
  → Skill in `.claude/skills/<name>/`

Does it isolate a heavy task in its own context window?
  → Sub-agent in `.claude/agents/` (native) or `.assistants/<owner>/sub-agents/` (orchestrator pattern)

Is it path-scoped guidance (applies only when certain files are open)?
  → Rule in `.claude/rules/<name>.md` with `paths:` frontmatter

Is it project-specific knowledge?
  → `projects/<name>/context.md`

Is it a tactical library quirk or environment gotcha?
  → `references/gotchas.md` (loaded on demand)

Is it a cross-cutting principle for one assistant?
  → Prose section in that assistant's brain file
  → If structural and blocking: a `## Section (Non-Negotiable)` gate
  → If just a small standing rule with no prose home: brain file Auto-updates (last resort)

Is it a meaningful one-time choice that affects direction?
  → `decisions/log.md`

Otherwise → it probably doesn't belong anywhere. Most one-off corrections live and die in the conversation.
```

`references/brain-file-architecture.md` carries the deeper version of this tree specifically for brain-file Auto-updates routing.

---

## 10. Productivity meta-principles

From Anthropic's best practices, applied to Cantos:

> "Give Claude a way to verify its work. This is the single highest-leverage thing you can do."

In Cantos: every UI task has the Visual Verification Gate; every non-trivial build goes through the Writing Plans discipline (see CLAUDE.md); every implementation passes verification-before-completion.

> "Explore first, then plan, then code."

In Cantos: Cantos's morph decision IS the explore step; the Writing Plans discipline is the plan step; spawning focused sub-agents per slice is the code step.

> "Manage context aggressively. Run `/clear` between unrelated tasks to reset context."

In Cantos: every wrap closes the session intentionally; long sessions are an anti-pattern, multiple morphs in one session is an anti-pattern.

> "Configure your environment."

In Cantos: hooks (brain_update_hook → queue) and permissions are configured in `.claude/settings.json`. MCP servers are optional — connect the ones you need (e.g. Gmail, Notion, GitHub, Calendar) as your assistants require them; none ship pre-configured.

> "Avoid the kitchen sink session."

In Cantos: Cantos morphs once per session and stays in that role. Switching mid-session is explicitly discouraged in CLAUDE.md.

---

## 11. Glossary of common confusions

- **CLAUDE.md vs brain files:** CLAUDE.md is Anthropic's mechanism, loaded for every Claude Code session. Brain files (`.assistants/<name>/<name>.md`) are our orchestrator pattern, loaded when Cantos morphs into that assistant. They @-import CLAUDE.md content transitively.
- **Rules vs references:** Rules in `.claude/rules/` auto-load (unconditional or path-scoped). References in `references/` load on demand or via explicit @-import. Don't double-load by putting a rule in `.claude/rules/` AND @-importing it.
- **Skills vs sub-agents:** A skill is a reusable instruction set that runs in the main context. A sub-agent runs in its own context window. Skill with `context: fork` straddles — the skill content becomes the sub-agent's task.
- **Auto-memory vs brain files:** Auto-memory (`.claude/agent-memory/` for sub-agents; project-wide `memory/` for the main session — RETIRED in Cantos) is automatic, machine-written. Brain files are human-curated. Cantos disables project-wide auto-memory; sub-agent auto-memory is still active and should be audited.
- **Decisions vs logs:** `decisions/log.md` is meaningful choices, human-readable, append-only. `logs/` is runtime telemetry from automated tools.
- **Docs vs references:** `docs/` holds working artifacts (specs, plans) for design work. `references/` holds stable system knowledge.

---

## Bottom line

Anthropic's docs are the foundation. Every Cantos divergence (the orchestrator+morph pattern, `.assistants/` instead of putting everything in `.claude/`, brain files supplementing CLAUDE.md) has to earn its place against this baseline. When in doubt, prefer the Anthropic-native vehicle: skill over rule, hook over skill (for mechanical enforcement), sub-agent over brain bullet (for context isolation).
