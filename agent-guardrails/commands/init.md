---
description: Create a starter .claude/guardrails.json (and a commented example) for this project
allowed-tools: Bash(python3:*)
---

Create the project guardrails configuration.

1. Run: `python3 "${CLAUDE_PLUGIN_ROOT}/scripts/init_config.py" $ARGUMENTS`
   (Useful arguments: `--policy strict-fintech|oss-maintainer|agency-client-work` to start from a starter policy, `--force` to overwrite.)
2. Report which files were written. Explain briefly that `.claude/guardrails.json` is the active policy and `.claude/guardrails.example.jsonc` is a commented reference that is not read by the plugin.
3. If the script refuses because the file exists, tell the user and offer to re-run with `--force` only if they ask.

Do not edit any other files.
