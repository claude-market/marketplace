---
description: Summarise the agent-guardrails audit log (events, tools, blocks, files touched, top commands)
allowed-tools: Bash(python3:*)
---

Run the audit report and present the result to the user.

1. Run: `python3 "${CLAUDE_PLUGIN_ROOT}/scripts/report.py" $ARGUMENTS`
   (Useful arguments: `--json` for machine output, `--session <id>` to filter, `--log <path>` to read a log other than the one named by `audit.path` in the config.)
2. Show the Markdown output as-is, then add two or three sentences pointing out anything notable, for example repeated blocks for the same rule or unexpected files touched.
3. If the script says no audit log exists yet, tell the user that the log is created on the first tool call after the plugin is enabled.

Do not edit any files and do not run other commands.
