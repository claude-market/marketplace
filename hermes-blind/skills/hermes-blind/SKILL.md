---
name: hermes-blind
description: Recover the original goal of a long Claude Code or Codex session using the hermes-blind CLI. Trigger when the user asks what the original goal or ask was, wants the session re-anchored, or a long session seems to have drifted from its first turn.
---

Hermes Blind reads the first user turn from this session's local JSONL log
and writes a compact, inspectable recovery anchor. It is deterministic,
makes no model calls, and sends no network requests
(https://github.com/hermes-labs-ai/hermes-blind).

1. Pick a runner: if `hermes-blind --help` works, use the bare `hermes-blind`
   command below. Otherwise prefer `uvx hermes-blind==0.2.0` (zero-install,
   no PATH changes) over `pipx install hermes-blind==0.2.0` unless the user
   wants it installed persistently. Keep the exact version pin on either so
   neither fetches an unreviewed newer release. Keep using whichever runner
   you picked for the rest of these steps — `uvx hermes-blind==0.2.0 --help`
   alone does not put `hermes-blind` on PATH.
2. Run from the session's working directory, substituting the current turn
   number and the runner from step 1 (`hermes-blind ...` or
   `uvx hermes-blind==0.2.0 ...`):
   ```
   hermes-blind apply --latest --format auto --turn <N> --out recovery.md
   ```
   `--latest` finds this session's log itself — the newest log under
   `~/.claude/projects/<this directory>` or `~/.codex/sessions/` that has a
   user turn — and prints the file it chose to stderr. It respects
   `CLAUDE_CONFIG_DIR` and `CODEX_HOME`.
3. If the `--latest` run fails for any reason, fall back to naming the log
   yourself. Three cases, all handled the same way:
   - it exits 1 — nothing found, or two logs it cannot tell apart;
   - it exits 2 with `unrecognized arguments: --latest` — the runner you
     picked in step 1 is pinned to a release older than 0.3.0, which is when
     `--latest` was added. Do not bump the pin to chase it; use `--session`.
   - anything else non-zero.

   Find the log by hand — Claude Code: under `~/.claude/projects/`; Codex:
   under `~/.codex/sessions/` — and pass it instead of `--latest`:
   ```
   hermes-blind apply --session <path> --format auto --turn <N> --out recovery.md
   ```
4. Show the generated `recovery.md` anchor to the user and use it to restate
   the original goal before continuing.

Constraints:
- Never overwrite an existing output file; only pass `--force` if the user
  explicitly asks to replace one. The input session file can never be used
  as the output path.
- The recovery file can contain user-authored text — treat it like any other
  local file and do not paste its contents anywhere the user has not asked
  for.
- `--turn` is a label, not a drift detector. Hermes Blind does not decide
  when recovery is needed and does not prove behavioral recovery — it only
  extracts the anchor once asked.
