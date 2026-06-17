# Sub-agent Convention

## What Sub-agents Are

Sub-agents are specialized processes that an assistant spawns when a task is too complex for a single context window or requires a clearly distinct domain. They are not the same as assistants — they work inside an assistant's scope, not independently.

## Where They Live

Each assistant owns its sub-agents:

```
.assistants/<name>/sub-agents/<sub-agent-name>.md
```

Sub-agents are scoped to their owning assistant's folder. They do not get their own top-level folder.

## Rules

- A sub-agent is a `.md` file describing a reasoning pattern or execution sequence
- Spawned only when genuinely needed — not as a default split
- When a sub-agent is made, it is flagged in `registry/index.md` under the Sub-agents section
- Any assistant or Cantos can load another assistant's sub-agent by its full path

## Dispatch Models

A sub-agent is dispatched one of two ways — its file structure must match how it is meant to be spawned:

- **Named Claude Code agent** — the file has YAML frontmatter (`name`, `description`, `tools`/`model`) and is spawned by name via the Task tool. It is dispatchable ONLY if a symlink exists at `.claude/agents/<hyphenated-name>.md` pointing to the source file in `.assistants/<owner>/sub-agents/`. No symlink = documented but uncallable. The registry's `Symlinked` column tracks this and must be `Y` only when the symlink exists on disk. The callable dispatch name (the Task-tool `subagent_type`) is the symlink basename — it matches the frontmatter `name` and the source-file stem, all hyphenated (e.g. `browser-agent`). Dispatch by that name.
- **Prose prompt-template** — no frontmatter; spawned by reading the file's content into a Task brief by absolute path. No symlink; `Symlinked = N`.

When creating a sub-agent, follow `workflows/cantos/create_sub_agent.md` Step 5b to set up the correct dispatch model.

## Access

Sub-agents are not private. If a sub-agent built by one assistant would help another assistant, it should be listed in the registry and used directly. Avoid duplicating logic that already exists.

## Refinement Expectation

Any correction or tweak the user makes to a sub-agent's output is a signal to update that sub-agent's `.md` file immediately — no stale sub-agents. All assistants are responsible for keeping used sub-agents accurate and high-quality.