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

- **Slash Command** - Reusable prompt template for frequent operations
- **Agent (Subagent)** - Specialized AI assistant for specific tasks
- **Hook** - Automated workflow trigger at lifecycle events
- **Skill** - Domain-specific expertise invoked when needed
- **MCP Server** - External tool/data source via Model Context Protocol

Present these as clear options explaining what each type does.

## Step 4: Collect Basic Information

Based on the selected component type, collect the essential information:

### For Slash Command:

Use AskUserQuestion to collect:

1. **Command name** (kebab-case, must not conflict with existing commands)
2. **Brief description** (what does this command do?)

### For Agent (Subagent):

Use AskUserQuestion to collect:

1. **Agent name** (kebab-case, must not conflict with existing agents)
2. **Brief description** (when should this agent be invoked?)

### For Hook:

Use AskUserQuestion to collect:

1. **Hook name** (kebab-case identifier)
2. **Brief description** (what workflow does this automate?)

### For Skill:

Use AskUserQuestion to collect:

1. **Skill name** (kebab-case, must not conflict with existing skills)
2. **Brief description** (what domain expertise does this provide?)

### For MCP Server:

Use AskUserQuestion to collect:

1. **Server name** (kebab-case identifier)
2. **Brief description** (what tools/data does this provide?)

## Step 5: Invoke Appropriate Builder Skill

Based on the component type selected, invoke the corresponding builder skill to handle the detailed generation:

### For Slash Command:

Invoke the `cc-command-builder` skill:

```
Create a new Claude Code slash command with the following details:
- Plugin: [plugin-name]
- Command name: [name]
- Description: [description]
- File path: [plugin-path]/commands/[command-name].md

Please guide the user through creating this command following best practices.
```

### For Agent (Subagent):

Invoke the `cc-agent-builder` skill:

```
Create a new Claude Code subagent with the following details:
- Plugin: [plugin-name]
- Agent name: [name]
- Description: [description]
- File path: [plugin-path]/agents/[agent-name].md

Please guide the user through creating this subagent following best practices.
```

### For Hook:

Invoke the `cc-hook-builder` skill:

```
Create a new Claude Code hook with the following details:
- Plugin: [plugin-name]
- Hook name: [name]
- Description: [description]
- File path: [plugin-path]/hooks/[hook-name].json

Please guide the user through creating this hook following best practices.
```

### For Skill:

Invoke the `cc-skill-builder` skill:

```
Create a new Claude Code skill with the following details:
- Plugin: [plugin-name]
- Skill name: [name]
- Description: [description]
- File path: [plugin-path]/skills/[skill-name].md

Please guide the user through creating this skill following best practices.
```

### For MCP Server:

Invoke the `cc-mcp-builder` skill:

```
Configure a new MCP server with the following details:
- Plugin: [plugin-name]
- Server name: [name]
- Description: [description]
- File path: [plugin-path]/mcp-servers/[server-name].json

Please guide the user through configuring this MCP server following best practices.
```

## Step 6: Update Plugin Manifest (Post-Generation)

**IMPORTANT:** After the builder skill completes and creates the component file, you must update plugin.json to include the new component.

Add the new component file path to the appropriate array in plugin.json:

- **commands**: Add to the `commands` array (e.g., `"./commands/my-command.md"`)
- **agents**: Add to the `agents` array (e.g., `"./agents/my-agent.md"`)
- **hooks**: Add path or inline config to `hooks` field
- **skills**: Add to the `skills` array (e.g., `"./skills/my-skill.md"`)
- **mcpServers**: Add path or inline config to `mcpServers` field

All paths must be relative to plugin root and begin with `./`

**Example:**

```json
{
  "name": "my-plugin",
  "commands": ["./commands/existing-command.md", "./commands/new-command.md"],
  "agents": ["./agents/existing-agent.md"],
  "skills": ["./skills/new-skill.md"]
}
```

## Step 7: Update README (Post-Generation)

Update the plugin's README.md to document the new component with usage examples.

## Step 8: Summary

Show the user:

- What was added (component type and name)
- File path of the new component
- Updated plugin.json showing the new component
- How to use the new component
- How to test it

## Important Notes:

- **Modular approach**: Each component type has its own specialized builder skill that handles the detailed generation
- **Ensure no conflicts**: Check that component names don't conflict with existing ones before invoking builder skills
- **Create directories**: Create component directories (commands/, agents/, hooks/, skills/, mcp-servers/) if they don't exist
- **Update manifest**: Always update plugin.json after component creation
- **Maintain consistency**: Ensure new components follow the style of existing ones
- **Version bump**: Increment patch version in plugin.json (e.g., 1.0.0 → 1.0.1)
