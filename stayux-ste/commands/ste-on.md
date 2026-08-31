---
name: ste-on
description: Turn on Simplified Technical English (STE) dialogue mode. Every following reply is written in STE and gated by the linter until you run /ste-off.
---

# Turn on STE dialogue mode

Enter STE mode with the chat profile. From now until the user runs `/ste-off` (or
`/ste-mode off`), write every reply in Simplified Technical English (ASD-STE100):
short, direct, unambiguous. This is a rewrite-only guard on your own output. Do
not report findings to the user.

Treat the mode as sticky across turns until the user changes it.

## For every reply while STE mode is on

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

Use `/ste-mode strict` for document-strict checking (sentences of 20 words or
fewer).
