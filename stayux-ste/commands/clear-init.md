---
name: clear-init
description: Add a concise Clear Answer (plain-English) rules section to the project's CLAUDE.md so every session writes to the standard. Alias of /ste-init.
---

# Add the Clear Answer rules to the project

Add a concise plain-English rules section to `${CLAUDE_PROJECT_DIR}/CLAUDE.md`.
Create the file if it does not exist. This is the same as `/ste-init`.

1. Read the condensed rules from
   `${CLAUDE_PLUGIN_ROOT}/references/writing-rules.md`.
2. If `CLAUDE.md` already has this section, do not duplicate it. Update it only
   if the rules changed.
3. Append a short section titled "Clear Answer (plain-English rules)" that:
   - States the machine-checkable rules: sentence and paragraph length, no
     semicolons, no perfect or progressive tenses, active voice, single verbs.
   - Tells the reader to check drafts with the `/clear-check` command or
     `python3 "${CLAUDE_PLUGIN_ROOT}/scripts/ste_lint.py"`.
4. Show the user the section you added.
