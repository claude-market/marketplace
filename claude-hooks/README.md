# claude-hooks

A lightweight hook system that makes Claude Code follow your rules automatically — every session, without repeating yourself.

## Installation

```bash
/plugin install claude-hooks
```

Or install from source:

```bash
git clone https://github.com/jaytoone/claude-hooks
cd claude-hooks
bash install.sh
```

**Requirements**: `bash`, `jq`

## What It Does

Every time you open Claude Code, this hook system:

- **Injects your workflow rules** — define how Claude should think and act; rules are delivered on every prompt without repeating yourself
- **Restores session context** — Claude picks up where you left off, even after closing and reopening
- **Loads recent docs automatically** — Git-Smart scans recent commits and auto-loads changed `docs/*.md` files

## Hooks

### `inject-system-prompt` (UserPromptSubmit)

Runs on every user prompt. Three things happen automatically:

1. Your `agent_nodes_template.md` rules are injected into the context
2. Previous work-progress is restored if a session ended recently
3. Recently modified docs are loaded based on git history (Git-Smart)

### `session-end-hint` (SessionEnd)

Runs when the session ends. Writes a hint file so Claude is reminded to update `MEMORY.md` at the start of the next session, preserving project state across sessions.

## Customization

Edit `~/.claude/hooks/agent_nodes_template.md` to define your workflow rules:

```markdown
## Project: my-app

- Tech stack: Next.js 15, TypeScript, Supabase
- Test command: pnpm test
- Do not modify files under src/generated/
```

### Git-Smart Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GIT_SMART_COMMIT_RANGE` | 3–10 | How many recent commits to scan |
| `GIT_SMART_MAX_FILES` | 2–5 | Maximum docs files to load |
| `GIT_SMART_LINES_PER_FILE` | 100–200 | Lines to read per file |

## What Gets Installed

```
~/.claude/
├── hooks/
│   ├── inject-system-prompt.sh     # UserPromptSubmit hook
│   ├── session-end-hint.sh         # SessionEnd hook
│   └── agent_nodes_template.md     # Your workflow rules
└── settings.json                   # Hook registration
```

## License

MIT — see [LICENSE](LICENSE)
