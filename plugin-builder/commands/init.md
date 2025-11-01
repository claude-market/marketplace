---
description: Initialize a new plugin with guided prompts
---

You are helping a user create a new Claude Code plugin. Follow this workflow step by step:

## Step 1: Get GitHub Username and Author Name

Use the AskUserQuestion tool to ask for:
- **GitHub username** - Will be used in CODEOWNERS for review assignments
- **Author name** - Will be used in plugin.json and CODEOWNERS

Ask the user for:

- **Plugin name** (kebab-case identifier)
- **Description** (what does this plugin do?)
- **License** (suggest MIT if unsure)

## Step 3: Create Plugin Directory

Create the directory structure at the top level:

```
./{plugin-name}/
./{plugin-name}/.claude-plugin/ # required
./{plugin-name}/commands/ # optional - only if 1 or more commands added
./{plugin-name}/agents/ # optional - only if 1 or more agents added
./{plugin-name}/hooks/ # optional - only if 1 or more hooks added
./{plugin-name}/skills/ # optional - only if 1 or more skills added
./{plugin-name}/mcp-servers/ # optional - only if 1 or more MCP servers added
```

## Step 4: Select Components to Create

Use AskUserQuestion with multiSelect=true to ask what components they want to create:

- Slash Command
- Agent (Subagent)
- Hook
- Skill
- MCP Server

## Step 5: For Each Component Type, Collect Details

### If they selected "Slash Command":

Ask these questions (you can ask multiple in one AskUserQuestion call):

1. **Command name** (kebab-case, will be invoked as /plugin-name:command-name)
2. **Command description** (one-line summary)
3. **What should this command do?** (detailed explanation of the command's purpose and behavior)
4. **What files/resources will it need to read or modify?**
5. **Should it use any specific tools?** (e.g., Bash, Read, Edit, Grep, etc.)

Then create:

- `./{plugin-name}/commands/{command-name}.md` with a comprehensive prompt that:
  - Clearly defines the command's purpose
  - Provides step-by-step instructions
  - Specifies which tools to use
  - Includes examples if relevant
  - Handles edge cases

### If they selected "Agent":

Ask these questions:

1. **Agent name** (kebab-case)
2. **Agent description** (what specialized task does it perform?)
3. **What problem does this agent solve?**
4. **What tools should it have access to?** (all tools, or specific subset?)
5. **What should be the default model?** (haiku for quick tasks, sonnet for complex)
6. **Any specific workflow or steps it should follow?**

Then create:

- `./{plugin-name}/agents/{agent-name}.md` with a detailed agent prompt that:
  - Defines the agent's specialized role
  - Specifies available tools
  - Provides clear workflow steps
  - Includes examples and best practices
  - Defines success criteria

### If they selected "Hook":

Ask these questions:

1. **Hook type** (choose one):
   - user-prompt-submit (runs before user input is sent)
   - tool-call (runs before/after tool execution)
   - agent-start (runs when agent starts)
   - agent-end (runs when agent completes)
2. **Hook name** (descriptive name)
3. **What behavior should this hook add/modify?**
4. **Should it block certain actions or just add information?**
5. **What command should it run?** (shell command)

Then create:

- `./{plugin-name}/hooks/{hook-name}.json` with proper hook configuration including:
  - Hook type
  - Trigger conditions
  - Command to execute
  - Whether it should block on failure

### If they selected "Skill":

Ask these questions:

1. **Skill name** (kebab-case)
2. **What domain/technology does this skill cover?**
3. **What specialized knowledge or capabilities should it provide?**
4. **What tools does it need access to?**
5. **What specific tasks should users invoke it for?**

Then create:

- `./{plugin-name}/skills/{skill-name}.md` with a comprehensive skill definition that:
  - Defines the domain expertise
  - Lists specific capabilities
  - Provides usage patterns
  - Includes domain-specific best practices
  - Specifies when to use this skill

### If they selected "MCP Server":

Ask these questions:

1. **Server name** (kebab-case)
2. **What tools/resources does this MCP server provide?**
3. **Connection details** (stdio command, or SSE URL)
4. **Any environment variables needed?**
5. **What Claude Code features should it enable?**

Then create:

- `./{plugin-name}/mcp-servers/{server-name}.json` with MCP server configuration

## Step 6: Create Plugin Manifest

Create `./{plugin-name}/.claude-plugin/plugin.json` with:

- name, version (start at 1.0.0), description, author, license
- Arrays listing the created components:
  - `commands`: array of {name, description} for each command
  - `agents`: array of {name, description} for each agent
  - `hooks`: array of {name, description} for each hook
  - `skills`: array of {name, description} for each skill
  - `mcpServers`: array of {name, description} for each MCP server
- keywords (generate relevant ones based on what was created)

## Step 7: Create CODEOWNERS

Create `./{plugin-name}/CODEOWNERS` file with the following format:

```
# Plugin maintainers and reviewers
* @claude-market @{github-username} {author-name}
```

Replace:
- `{github-username}` with the GitHub username from Step 1
- `{author-name}` with the author name from Step 1 (without @ symbol)

This ensures that:
- The Claude Market organization is always notified
- The plugin creator's GitHub account is tagged for review
- The author name is listed for visibility

## Step 8: Create README

Create a README.md in the plugin directory that includes:

- Plugin name and description
- Installation instructions (`/plugin install ./{plugin-name}`)
- List of components with usage examples
- Requirements (if any)
- License information

## Step 9: Summary

Provide the user with:

- Path to their new plugin
- List of all created files
- Next steps (how to test it, how to install it locally, how to submit to marketplace)
- Command to install locally: `/plugin install ./{plugin-name}`

## Important Guidelines:

- **Write comprehensive, detailed prompts** for commands/agents/skills. The quality of the plugin depends on clear, actionable instructions.
- **Include examples** wherever possible to illustrate expected behavior.
- **Think about edge cases** and include handling for them.
- **Use proper markdown formatting** including code blocks, lists, and sections.
- **Follow Claude Code best practices**:
  - Commands should use appropriate tools (Read, Edit, Grep, Glob, Bash)
  - Agents should have clear, focused purposes
  - Hooks should be non-intrusive and helpful
- **Validate inputs**: ensure names are in kebab-case, descriptions are clear, etc.

## Example Interaction Flow:

1. Ask for GitHub username → "awesome-dev" and author name → "Awesome Developer"
2. Ask for plugin metadata → name: "react-helpers", description: "Helpers for React development"
3. Create `./react-helpers/` directory
4. Ask what to create → [Slash Command, Agent]
5. For command → name: "add-component", description: "Add a new React component with tests"
6. Collect detailed requirements for the command
7. Generate well-structured command file
8. For agent → name: "react-optimizer", description: "Optimize React components for performance"
9. Collect agent requirements
10. Generate agent file
11. Create plugin.json with metadata
12. Create CODEOWNERS with @claude-market @awesome-dev Awesome Developer
13. Create README.md
14. Show summary and next steps

Begin by asking for the GitHub username and author name!
