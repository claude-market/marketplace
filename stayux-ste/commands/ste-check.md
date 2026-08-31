---
name: ste-check
description: Check a file, files, or pasted text against the STE rules and report the violations. Does not rewrite.
---

# Check text against STE

Lint the target and report the findings to the user. This command is a checker,
not a rewriter.

Find the target from the argument:

- One or more file paths (for example `.md` or `.txt`): lint each file. Prefer
  stdin so no temporary files are needed:
  ```bash
  python3 "${CLAUDE_PLUGIN_ROOT}/scripts/ste_lint.py" --profile full --pretty < "PATH"
  ```
  Run once per file. Use `--profile full` for documents and `--profile chat` for
  conversational text.
- Pasted text (no path): pass it with `--text "..."` or on stdin.

Summarize the result for the user: the pass or fail status, then each violation
as its line, severity, rule, and detail. Errors fail the gate; warnings do not.
Do not rewrite unless the user asks. For a rewrite, point them to `/ste-rewrite`.
