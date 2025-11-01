---
name: cc-hook-builder
description: This skill should be used when users want to create a new Claude Code hook. Use this skill to help users design, structure, and implement highly effective hooks that automate workflows at specific lifecycle events.
allowed-tools: Read,Write,Glob,Grep,AskUserQuestion,Bash
model: inherit
version: 1.0.0
license: MIT
---

# Claude Code Hook Builder

Create highly effective hooks following industry best practices for lifecycle automation, event handling, and secure shell command execution.

## Overview

Hooks are automated triggers that execute shell commands at specific points during Claude Code's operation. They function as "if this, then that" rules for your coding assistant, enabling workflow automation, validation, notifications, and custom behaviors.

This skill helps you create hooks that:

- Follow proper JSON configuration structure
- Use appropriate lifecycle events
- Implement secure shell command execution
- Handle blocking vs non-blocking operations correctly
- Apply matchers for targeted tool filtering
- Process tool input/output via stdin

## Hook Anatomy

Every hook is defined in JSON configuration within `~/.claude/settings.json` or project-level settings:

### Basic Structure

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "path/to/script.sh"
          }
        ]
      }
    ]
  }
}
```

### Configuration Fields

**Top-level organization:**

- `hooks`: Object containing hook events as keys
- Each event: Array of matcher-hook pairs

**Matcher configuration:**

- `matcher`: Tool name pattern to target (e.g., `"Bash"`, `"Edit|Write"`, `"*"`)
- `hooks`: Array of hook definitions to execute when matcher triggers

**Hook definition:**

- `type`: Always `"command"` for shell execution
- `command`: Shell command to execute (receives JSON via stdin)

## Available Hook Events

Claude Code provides several lifecycle hooks:

### PreToolUse

**When**: Before tool execution
**Can block**: Yes (exit code 2 blocks operation)
**Use cases**:

- Validation before file edits
- Security checks before bash commands
- Confirmation prompts
- Preventing destructive operations

### PostToolUse

**When**: After tool completes
**Can block**: No
**Use cases**:

- Automatic formatting after file edits
- Logging completed operations
- Triggering downstream automation
- Updating external systems

### UserPromptSubmit

**When**: When user submits a prompt
**Can block**: No
**Use cases**:

- Logging user requests
- Adding context automatically
- Triggering external notifications
- Analytics tracking

### Notification

**When**: Claude Code sends notifications
**Can block**: No
**Use cases**:

- Custom notification routing
- Desktop notifications
- Slack/Teams integration
- Alert logging

### Stop

**When**: Response finishes
**Can block**: No
**Use cases**:

- Session tracking
- Performance metrics
- Cleanup operations
- Status updates

### SubagentStop

**When**: Subagent task completes
**Can block**: No
**Use cases**:

- Subagent performance tracking
- Result logging
- Chaining subagent workflows
- Analytics

### PreCompact

**When**: Before context compaction
**Can block**: No
**Use cases**:

- Backup important context
- Archive conversation state
- Notify about compaction
- Metrics collection

### SessionStart

**When**: Session initiation
**Can block**: No
**Use cases**:

- Environment setup
- Loading project context
- Logging session start
- Initialization tasks

### SessionEnd

**When**: Session termination
**Can block**: No
**Use cases**:

- Cleanup temporary files
- Save session state
- Generate session reports
- Close external connections

## Matchers

Matchers target specific tools for hook execution:

### Tool-Specific Matchers

```json
{
  "matcher": "Bash"
}
```

Targets only the Bash tool.

### Multiple Tool Matchers

```json
{
  "matcher": "Edit|Write"
}
```

Targets Edit OR Write tools (pipe-separated).

### Universal Matcher

```json
{
  "matcher": "*"
}
```

Targets ALL tools (use sparingly for performance).

### Common Patterns

- **File operations**: `"Edit|Write|Read"`
- **Git operations**: `"Bash"` (when you only want git commands)
- **Everything**: `"*"`

## Blocking Operations

PreToolUse hooks can prevent tool execution based on exit codes:

### Allow Operation (Exit 0)

```bash
#!/bin/bash
# Validation passed, allow operation
exit 0
```

### Block Operation (Exit 2)

```bash
#!/bin/bash
# Validation failed, block operation
echo "Error: Cannot edit production files" >&2
exit 2
```

### Example: Prevent Production File Edits

```bash
#!/bin/bash
FILE_PATH=$(echo "$1" | jq -r '.tool_input.file_path')

if [[ "$FILE_PATH" == *"/prod/"* ]]; then
  echo "BLOCKED: Cannot edit production files directly" >&2
  exit 2
fi

exit 0
```

**Important**: Only PreToolUse hooks can block. Other events ignore exit codes.

## Input/Output Handling

Hooks receive JSON via stdin containing tool context:

### Input Schema

```json
{
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/path/to/file.js",
    "old_string": "const x = 1",
    "new_string": "const x = 2"
  }
}
```

### Parsing with jq

```bash
#!/bin/bash
TOOL_NAME=$(echo "$1" | jq -r '.tool_name')
FILE_PATH=$(echo "$1" | jq -r '.tool_input.file_path')
COMMAND=$(echo "$1" | jq -r '.tool_input.command')

echo "Tool: $TOOL_NAME"
echo "File: $FILE_PATH"
```

### Example: Log All File Edits

```bash
#!/bin/bash
TOOL_INPUT=$(cat)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "$TIMESTAMP: $TOOL_INPUT" >> ~/.claude/edit-log.jsonl
```

## Best Practices

### Security

**Always review hook implementations** before registering:

- Hooks execute with your environment credentials
- Malicious hooks can compromise your system
- Validate inputs to prevent command injection
- Use absolute paths for sensitive operations

**Example: Secure input handling**

```bash
#!/bin/bash
FILE_PATH=$(echo "$1" | jq -r '.tool_input.file_path')

# Validate file path doesn't escape project
if [[ "$FILE_PATH" == ../* ]]; then
  echo "BLOCKED: Path traversal attempt" >&2
  exit 2
fi
```

### Performance

**Use specific matchers** instead of universal:

- `"Edit"` - Better than `"*"`
- `"Bash"` - Better than `"*"`
- Reduces hook executions
- Improves response time

**Keep hook scripts fast**:

- Avoid expensive operations in PreToolUse (blocks Claude)
- Use background jobs for slow tasks
- Cache results when possible
- Log errors efficiently

### Scope

**User settings** (`~/.claude/settings.json`):

- Hooks available across all projects
- Personal workflow automation
- Global policies and validations

**Project settings** (`.claude/settings.json`):

- Team-shared hooks
- Project-specific workflows
- Committed to version control

**Choose scope wisely**:

- Security policies: User-level
- Team standards: Project-level
- Personal preferences: User-level

## Common Hook Patterns

### 1. Auto-Format on Save

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'FILE=$(jq -r \".tool_input.file_path\"); prettier --write \"$FILE\" 2>/dev/null'"
          }
        ]
      }
    ]
  }
}
```

### 2. Git Commit Validation

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/validate-commit.sh"
          }
        ]
      }
    ]
  }
}
```

**validate-commit.sh:**

```bash
#!/bin/bash
COMMAND=$(jq -r '.tool_input.command')

# Check if this is a git commit
if [[ "$COMMAND" != *"git commit"* ]]; then
  exit 0
fi

# Extract commit message
MSG=$(echo "$COMMAND" | grep -oP 'git commit -m "\K[^"]+')

# Validate conventional commit format
if [[ ! "$MSG" =~ ^(feat|fix|docs|style|refactor|test|chore):.+ ]]; then
  echo "BLOCKED: Commit message must follow Conventional Commits format" >&2
  echo "Example: feat: add user authentication" >&2
  exit 2
fi

exit 0
```

### 3. Prevent Sensitive File Edits

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/protect-secrets.sh"
          }
        ]
      }
    ]
  }
}
```

**protect-secrets.sh:**

```bash
#!/bin/bash
FILE_PATH=$(jq -r '.tool_input.file_path')

SENSITIVE_FILES=(".env" "credentials.json" "id_rsa" ".ssh/")

for pattern in "${SENSITIVE_FILES[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "BLOCKED: Cannot edit sensitive file: $FILE_PATH" >&2
    exit 2
  fi
done

exit 0
```

### 4. Logging and Audit Trail

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/audit-log.sh"
          }
        ]
      }
    ]
  }
}
```

**audit-log.sh:**

```bash
#!/bin/bash
TOOL_INPUT=$(cat)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
LOG_FILE=~/.claude/audit.jsonl

# Append to audit log
echo "{\"timestamp\":\"$TIMESTAMP\",\"event\":$TOOL_INPUT}" >> "$LOG_FILE"
```

### 5. Desktop Notifications

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/notify.sh"
          }
        ]
      }
    ]
  }
}
```

**notify.sh (macOS):**

```bash
#!/bin/bash
osascript -e 'display notification "Claude Code task completed" with title "Claude Code"'
```

**notify.sh (Linux with notify-send):**

```bash
#!/bin/bash
notify-send "Claude Code" "Task completed"
```

### 6. Test Runner on File Changes

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/auto-test.sh"
          }
        ]
      }
    ]
  }
}
```

**auto-test.sh:**

```bash
#!/bin/bash
FILE_PATH=$(jq -r '.tool_input.file_path')

# Only run tests for source files, not test files
if [[ "$FILE_PATH" == *".test."* ]] || [[ "$FILE_PATH" == *"__tests__"* ]]; then
  exit 0
fi

# Run tests in background to not block Claude
(cd "$(dirname "$FILE_PATH")/../.." && npm test -- --related "$FILE_PATH" 2>&1) &
```

### 7. Code Quality Checks

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/lint-check.sh"
          }
        ]
      }
    ]
  }
}
```

**lint-check.sh:**

```bash
#!/bin/bash
FILE_PATH=$(jq -r '.tool_input.file_path')
CONTENT=$(jq -r '.tool_input.content')

# Only lint JavaScript/TypeScript files
if [[ ! "$FILE_PATH" =~ \.(js|ts|jsx|tsx)$ ]]; then
  exit 0
fi

# Write content to temp file for linting
TMP_FILE=$(mktemp)
echo "$CONTENT" > "$TMP_FILE"

# Run ESLint
if ! eslint "$TMP_FILE" 2>&1; then
  echo "BLOCKED: Code does not pass linting" >&2
  rm "$TMP_FILE"
  exit 2
fi

rm "$TMP_FILE"
exit 0
```

## Hook Creation Workflow

When a user asks to create a hook, follow these steps:

### Step 1: Gather Requirements

Use AskUserQuestion to collect:

1. **Hook purpose** (what should it do?)
2. **Trigger event** (PreToolUse, PostToolUse, etc.)
3. **Target tools** (specific tools or all?)
4. **Blocking behavior** (should it prevent operations?)
5. **Scope** (user-level or project-level?)

### Step 2: Select Hook Event

Match purpose to appropriate event:

- **Validation/Prevention**: PreToolUse (can block)
- **Post-processing**: PostToolUse
- **Logging**: Any event, typically PostToolUse or Stop
- **Notifications**: Stop, SubagentStop, or Notification
- **Setup/Teardown**: SessionStart, SessionEnd

### Step 3: Design Matcher

Choose appropriate tool targeting:

- **Specific operations**: Name the exact tool (e.g., `"Bash"`)
- **Related operations**: Use pipe (e.g., `"Edit|Write"`)
- **All operations**: Use `"*"` (use sparingly)

### Step 4: Write Shell Script

Create the hook script with:

1. **Shebang**: `#!/bin/bash` or `#!/usr/bin/env bash`
2. **Input parsing**: Use `jq` to extract relevant fields
3. **Logic**: Implement the hook's behavior
4. **Exit code**: 0 for allow, 2 for block (PreToolUse only)
5. **Error handling**: Log errors to stderr

### Step 5: Configure JSON

Create or update settings.json:

```json
{
  "hooks": {
    "[EventName]": [
      {
        "matcher": "[ToolMatcher]",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/hook-script.sh"
          }
        ]
      }
    ]
  }
}
```

### Step 6: Make Script Executable

```bash
chmod +x /path/to/hook-script.sh
```

### Step 7: Test Hook

1. Create a test scenario
2. Trigger the hook event
3. Verify expected behavior
4. Check logs/output
5. Refine as needed

## Output Format

When creating a hook, deliver:

1. **Complete shell script** with comments explaining logic
2. **JSON configuration** for settings.json
3. **File paths** where script and config should be saved
4. **Installation instructions** including chmod command
5. **Testing instructions** for validating the hook works
6. **Security notes** highlighting any permission requirements

## Error Handling

If hook requirements are unclear:

1. Ask clarifying questions about the workflow
2. Suggest similar existing hooks as references
3. Explain trade-offs between PreToolUse (blocking) vs PostToolUse
4. Recommend project vs user scope based on use case

If security concerns exist:

1. Highlight potential security implications
2. Suggest input validation techniques
3. Recommend testing in isolation first
4. Explain credential/permission requirements

## Resources

- Claude Code Hooks Guide: https://docs.claude.com/en/docs/claude-code/hooks-guide
- Claude Code Hooks Mastery: https://github.com/disler/claude-code-hooks-mastery
- jq Documentation: https://stedolan.github.io/jq/manual/

## Key Principles

1. **Security first** - Always review and validate hook scripts
2. **Specific matchers** - Target exact tools, avoid universal `"*"`
3. **Fast execution** - Keep PreToolUse hooks lightweight
4. **Appropriate events** - Match hook event to purpose
5. **Proper scope** - User for personal, project for team
6. **Exit codes matter** - 0 allows, 2 blocks (PreToolUse only)
7. **Parse input safely** - Use jq, validate data
8. **Log errors** - Use stderr for error messages

When in doubt, create a simpler, more focused hook rather than a complex multi-purpose one.
