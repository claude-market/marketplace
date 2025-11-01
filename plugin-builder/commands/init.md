---
description: Initialize a new plugin with guided prompts
---

You are helping a user create a new Claude Code plugin. Follow this workflow step by step:

## Step 1: Get GitHub Username and Fetch Profile

Use the AskUserQuestion tool to ask for:
- **GitHub username** - Will be used in CODEOWNERS and to fetch author information

Once you have the GitHub username, use WebFetch to fetch their profile:
- URL: `https://api.github.com/users/{username}`
- Extract the `name` field from the response
- If `name` is present and not null, use it as the author name
- If `name` is null or missing, use the GitHub username as the author name

## Step 2: Collect Plugin Metadata

Ask the user for:

- **Plugin name** (kebab-case identifier, unique)
- **Description** (what does this plugin do?)
- **Version** (default: "1.0.0" if not specified)
- **License** (default: "MIT" if unsure)
- **Homepage** (optional - documentation URL)
- **Repository** (optional - source code URL, can default to GitHub repo if they want)
- **Keywords** (optional - array of tags for discoverability)
- **Author email** (optional - contact email)
- **Author URL** (optional - personal website/profile)

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

Create `./{plugin-name}/.claude-plugin/plugin.json` following the complete schema:

### Required Fields

- **name** (string): Plugin identifier in kebab-case, unique across all plugins

### Metadata Fields (All Optional)

- **version** (string): Semantic versioning (e.g., "1.0.0", "2.1.0")
- **description** (string): Brief explanation of plugin purpose
- **author** (object): Author information with these properties:
  - `name` (string): Author or organization name (from GitHub profile or username)
  - `email` (string, optional): Contact email address
  - `url` (string, optional): Author's website or profile URL
- **homepage** (string): Documentation URL link
- **repository** (string): Source code repository URL
- **license** (string): License identifier (MIT, Apache-2.0, etc.)
- **keywords** (array of strings): Discovery and categorization tags

### Component Path Fields (Optional)

List the components you want to include in your plugin:

- **commands** (string or array): Command markdown files (e.g., `["./commands/init.md", "./commands/add.md"]`)
- **agents** (string or array): Agent markdown files (e.g., `["./agents/optimizer.md"]`)
- **hooks** (string or object): Hook configuration file path or inline JSON config
- **mcpServers** (string or object): MCP server configuration file path or inline config
- **skills** (string or array): Skill markdown files (e.g., `["./skills/react.md"]`)

All paths must be relative to plugin root and begin with `./`

### Example Plugin Manifest

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "A helpful plugin for productivity",
  "author": {
    "name": "John Doe",
    "email": "john@example.com",
    "url": "https://github.com/johndoe"
  },
  "homepage": "https://github.com/johndoe/my-plugin",
  "repository": "https://github.com/johndoe/my-plugin",
  "license": "MIT",
  "keywords": ["helper", "productivity", "automation"],
  "commands": [
    "./commands/helper.md"
  ],
  "agents": [
    "./agents/assistant.md"
  ]
}
```

**Schema Notes:**
- Only `name` is required; all other fields are optional
- `author` must be an object (not a string) if provided
- Components must be explicitly listed in their respective arrays (e.g., commands, agents, skills)
- Include only fields that have values; omit empty/null fields

## Step 7: Create CODEOWNERS

Create `./{plugin-name}/CODEOWNERS` file with the following format:

```
# Plugin maintainers and reviewers
* @claude-market @{github-username}
```

Replace:
- `{github-username}` with the GitHub username from Step 1

This ensures that:
- The Claude Market organization is always notified
- The plugin creator's GitHub account is tagged for review

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

1. Ask for GitHub username → "awesome-dev"
2. Fetch GitHub profile → Extract name "Awesome Developer" (or use "awesome-dev" if no name)
3. Ask for plugin metadata → name: "react-helpers", description: "Helpers for React development", email (optional), etc.
4. Create `./react-helpers/` directory
5. Ask what to create → [Slash Command, Agent]
6. For command → name: "add-component", description: "Add a new React component with tests"
7. Collect detailed requirements for the command
8. Generate well-structured command file
9. For agent → name: "react-optimizer", description: "Optimize React components for performance"
10. Collect agent requirements
11. Generate agent file
12. Create plugin.json with complete metadata (name from GitHub, optional email/url if provided)
13. Create CODEOWNERS with @claude-market @awesome-dev
14. Create README.md
15. Show summary and next steps

Begin by asking for the GitHub username!
