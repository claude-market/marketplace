---
description: Add a new component to an existing plugin
---

You are helping a user add a new component to an existing Claude Code plugin.

## Step 1: Select Plugin

Use Glob to find all plugins in `./*/.claude-plugin/plugin.json` and ask the user which plugin they want to add to (or let them specify a path).

## Step 2: Read Current Plugin Configuration

Read the plugin.json to understand what components already exist.

## Step 3: Select Component Type to Add

Use AskUserQuestion to ask what type of component they want to add:

- Slash Command
- Agent (Subagent)
- Hook
- Skill
- MCP Server

## Step 4: Collect Component Details

Follow the same detailed question flow as in the init command for the selected component type:

### For Slash Command:

1. Command name (kebab-case, must not conflict with existing commands)
2. Command description
3. What should this command do? (detailed explanation)
4. What files/resources will it need?
5. What tools should it use?

Create `commands/{command-name}.md` with comprehensive prompt (create `commands/` directory if it doesn't exist).

### For Agent:

1. Agent name (kebab-case)
2. Agent description
3. What problem does it solve?
4. What tools should it have access to?
5. Default model (haiku/sonnet/opus)
6. Specific workflow steps?

Create `agents/{agent-name}.md` with detailed agent prompt (create `agents/` directory if it doesn't exist).

### For Hook:

1. Hook type (user-prompt-submit, tool-call, agent-start, agent-end)
2. Hook name
3. What behavior to add/modify?
4. Should it block actions?
5. Command to run?

Create `hooks/{hook-name}.json` with hook configuration (create `hooks/` directory if it doesn't exist).

### For Skill:

1. Skill name (kebab-case)
2. Domain/technology coverage
3. Specialized knowledge to provide
4. Tools needed
5. Specific tasks to handle

Create `skills/{skill-name}.md` with skill definition (create `skills/` directory if it doesn't exist).

### For MCP Server:

1. Server name (kebab-case)
2. Tools/resources provided
3. Connection details (stdio/SSE)
4. Environment variables
5. Features enabled

Create `mcp-servers/{server-name}.json` with MCP config (create `mcp-servers/` directory if it doesn't exist).

## Step 5: Update Plugin Manifest

Update the plugin.json to add the new component to the appropriate array (commands, agents, hooks, skills, or mcpServers) with name and description.

## Step 6: Update README

Update the plugin's README.md to document the new component with usage examples.

## Step 7: Summary

Show the user:

- What was added
- File path of the new component
- Updated plugin.json
- How to use the new component

## Important:

- Ensure component names don't conflict with existing ones
- Maintain consistent style with existing components
- Update version number in plugin.json (increment patch version)
- Write high-quality, detailed prompts that follow best practices
