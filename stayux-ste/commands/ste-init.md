---
name: ste-init
description: Add a concise STE rules section to the project's CLAUDE.md so every session writes to the standard.
---

# Add STE rules to the project

Add a concise STE section to `${CLAUDE_PROJECT_DIR}/CLAUDE.md`. Create the file if
it does not exist.

1. Read the condensed rules from
   `${CLAUDE_PLUGIN_ROOT}/references/writing-rules.md`.
2. If `CLAUDE.md` already has an STE section, do not duplicate it. Update it only
   if the rules changed.
3. Append a short section titled "Simplified Technical English (STE)" that:
   - States the machine-checkable rules: sentence and paragraph length, no
     semicolons, no perfect or progressive tenses, active voice, single verbs.
   - Tells the reader to check drafts with the `/ste-check` command or
     `python3 "${CLAUDE_PLUGIN_ROOT}/scripts/ste_lint.py"`.
4. Show the user the section you added.
