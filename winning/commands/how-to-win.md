---
description: "Research what winning means for a specific situation — deploys 3 research agents across 3 rounds"
argument-hint: "QUESTION"
---

# How to Win

This command launches the How to Win research skill.

## Step 1: Validate

The user must provide a question or topic to research. If `$ARGUMENTS` is empty, ask:

```
What do you want to research? Examples:
  /winning:how-to-win making our API faster
  /winning:how-to-win migrating from REST to GraphQL
  /winning:how-to-win improving test coverage
```

## Step 2: Delegate

Follow the research process defined in `${CLAUDE_PLUGIN_ROOT}/skills/how-to-win/SKILL.md`. Start from Round 1. Do not skip rounds.

The question to research is: $ARGUMENTS
