# Hermes Blind

Recover the original goal of a long Claude Code or Codex session from its first
user turn, so you can restate it before continuing.

Long agent sessions can lose the shape of the request that started them. Hermes
Blind reads the first user turn from a local Claude Code or Codex JSONL session
log and writes a compact recovery anchor you can inspect and paste back into the
session. It is deterministic: it makes no model calls and sends no network
requests.

## Installation

```bash
/plugin install hermes-blind
```

## Requirements

The skill drives the `hermes-blind` command-line tool, which is a separate
Python package (Python 3.10+). The skill picks a runner at use time and prefers
a zero-install one:

```bash
# zero-install, no PATH changes (preferred by the skill)
uvx hermes-blind==0.2.0 --help

# or install it persistently
pipx install hermes-blind
```

The skill pins an exact version on `uvx`/`pipx` so it never fetches an
unreviewed newer release. No API key, environment variable, or network access is
required by the tool itself.

## Components

### Skills (1)

**`hermes-blind`** — recovers the original goal of the current session.

Claude invokes it when you ask what the original goal or ask was, ask for the
session to be re-anchored, or when a long session appears to have drifted from
its first turn.

What it does:

1. Picks a runner (`hermes-blind` on PATH, else `uvx`, else `pipx`).
2. Runs `hermes-blind apply --latest --format auto --turn <N> --out recovery.md`
   from the session's working directory. `--latest` selects the newest log with
   a user turn under `~/.claude/projects/<this directory>` or
   `~/.codex/sessions/`, honouring `CLAUDE_CONFIG_DIR` and `CODEX_HOME`.
3. Falls back to naming the log explicitly with `--session <path>` if the
   `--latest` run exits non-zero — including when the pinned runner predates the
   release that added `--latest`.
4. Shows the generated `recovery.md` anchor and uses it to restate the original
   goal before continuing.

Example:

```
> we've been at this a while — what was the original ask?

[Claude runs hermes-blind apply --latest ... and shows recovery.md]
```

Safety constraints carried by the skill:

- It never overwrites an existing output file; `--force` is only passed if you
  explicitly ask for a replacement. The input session file can never be the
  output path.
- The recovery file can contain user-authored text and is treated like any other
  local file — its contents are not pasted anywhere you have not asked for.

## Limits

- `--turn` is a label, not a drift detector. Hermes Blind does not decide when
  recovery is needed and does not prove behavioral recovery — it extracts the
  anchor once asked.
- The upstream package is on a 0.x line and is labelled experimental; the public
  surface may change before 1.0.
- Only Claude Code and Codex local JSONL session logs are supported.

## Links

- Source: https://github.com/hermes-labs-ai/hermes-blind
- Homepage: https://hermes-labs.ai/open-source

## License

MIT — see [LICENSE](./LICENSE).
