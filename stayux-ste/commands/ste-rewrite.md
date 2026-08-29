---
name: ste-rewrite
description: Rewrite the given text or file into Simplified Technical English, then show a before/after comparison.
---

# Rewrite into STE

Take the user's text (the command argument, a pasted block, or a named file) and
rewrite it into Simplified Technical English.

1. Rewrite the text using the rules in
   `${CLAUDE_PLUGIN_ROOT}/references/writing-rules.md`.
2. Lint the rewrite until it passes:
   ```bash
   python3 "${CLAUDE_PLUGIN_ROOT}/scripts/ste_lint.py" --profile full --pretty <<'EOF'
   <your rewrite>
   EOF
   ```
   Use `--profile full` for documents and `--profile chat` for conversational
   text.
3. Show a short before and after: the original text, then the STE version. Keep
   the meaning. Note any term you could not simplify without a loss of meaning.
