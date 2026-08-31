---
name: clear-on
description: Turn on Clear Answer mode. Every following reply is written in short, plain English and gated by the linter until you run /clear-off. Alias of /ste-on.
---

# Turn on Clear Answer mode

Enter Clear Answer mode with the chat profile. This is the same mode as `/ste-on`.
From now until the user runs `/clear-off` (or `/clear-mode off`), write every reply
in short, direct, plain English (Simplified Technical English, ASD-STE100). This is
a rewrite-only guard on your own output. Do not report findings to the user.

Treat the mode as sticky across turns until the user changes it.

## For every reply while Clear Answer mode is on

1. Draft the reply using the rules in
   `${CLAUDE_PLUGIN_ROOT}/skills/ste-write/SKILL.md` and
   `${CLAUDE_PLUGIN_ROOT}/references/writing-rules.md`.
2. Lint the draft. It is the objective gate:
   ```bash
   python3 "${CLAUDE_PLUGIN_ROOT}/scripts/ste_lint.py" --profile chat --pretty <<'EOF'
   <your draft>
   EOF
   ```
3. If `passed` is false, rewrite the flagged sentences and lint again. Repeat
   until `passed` is true.
4. Send only the final compliant text. Do not show the linter output.

Use `/clear-mode strict` for document-strict checking (sentences of 20 words or
fewer).
