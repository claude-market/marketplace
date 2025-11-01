# Plugin Builder

Interactive plugin builder for Claude Code - serves as both an example plugin and a tool to create new plugins through guided prompts.

## Overview

The Plugin Builder helps you create high-quality Claude Code plugins through an interactive, question-based workflow. It handles all the scaffolding and ensures your plugins follow best practices.

## Features

- **Modular builder architecture** - Specialized builder skills for each component type (commands, agents, hooks, skills, MCP servers)
- **Guided plugin creation** - Interactive prompts walk you through creating any type of component
- **Multi-component support** - Create commands, agents, hooks, skills, and MCP servers in one session
- **Best practices built-in** - Each builder skill follows industry best practices and context engineering principles
- **Natural language editing** - Edit existing components by describing changes in plain English
- **Example reference** - The plugin itself demonstrates proper plugin structure
- **Validation tools** - Check your plugins for common issues before publishing

## Installation

```bash
/plugin install ./plugin-builder
```

Or if adding from the Claude Market marketplace:

```bash
/plugin marketplace add claude-market/marketplace
/plugin install plugin-builder
```

## Commands

### `/plugin-builder:init`

Initialize a new plugin with guided prompts.

**Workflow:**

1. Asks for your GitHub username (for CODEOWNERS)
2. Collects plugin metadata (name, description, license)
3. Creates top-level plugin directory (`./{plugin-name}/`)
4. Asks what components you want to create (commands, agents, hooks, skills, MCP servers)
5. For each component, asks detailed questions to understand requirements
6. Generates all files with comprehensive, well-structured prompts
7. Creates plugin manifest, CODEOWNERS, and README
8. Shows summary and installation instructions

**Example usage:**

```
/plugin-builder:init
```

### `/plugin-builder:add`

Add a new component to an existing plugin using specialized builder skills.

**Use this when:**

- You already have a plugin and want to add another command, agent, hook, skill, or MCP server
- You want to expand your plugin's functionality

**Workflow:**

1. Select which plugin to add to
2. Choose component type to add (Command, Agent, Hook, Skill, or MCP Server)
3. Provide basic information (name and brief description)
4. Appropriate builder skill is invoked to guide you through detailed creation:
   - **Commands**: `cc-command-builder` handles slash command creation
   - **Agents**: `cc-agent-builder` handles subagent creation
   - **Hooks**: `cc-hook-builder` handles hook configuration
   - **Skills**: `cc-skill-builder` handles skill creation
   - **MCP Servers**: `cc-mcp-builder` handles MCP server configuration
5. Builder skill generates the component following best practices
6. Updates plugin.json and README automatically

**Example usage:**

```
/plugin-builder:add
```

### `/plugin-builder:edit`

Use natural language to make edits to your existing plugin components with specialized builder skill assistance.

**Use this when:**

- You want to modify an existing command, agent, hook, skill, or MCP server
- You need to update functionality, fix issues, or refactor a component
- You want to make changes using conversational descriptions instead of manual file editing

**Workflow:**

1. Select which plugin to edit
2. Choose which component to modify
3. Describe your desired changes in natural language
4. Appropriate builder skill is invoked with context about the existing component:
   - **Commands**: `cc-command-builder` helps apply changes
   - **Agents**: `cc-agent-builder` helps apply changes
   - **Hooks**: `cc-hook-builder` helps apply changes
   - **Skills**: `cc-skill-builder` helps apply changes
   - **MCP Servers**: `cc-mcp-builder` helps apply changes
5. Builder skill interprets your intent and applies edits following best practices
6. Review the changes and confirm
7. Optionally update README and version number

**Example natural language edits:**

- "Add validation for email addresses"
- "Make it ask for confirmation before deleting"
- "Change the default model from haiku to sonnet"
- "Add better error handling"
- "Include usage examples in the documentation"
- "Make it work with TypeScript files too"

**Example usage:**

```
/plugin-builder:edit
```

### `/plugin-builder:validate`

Validate plugin structure and configuration.

**Checks:**

- Required files exist (plugin.json, component files)
- Directory structure is correct
- JSON files are valid
- Plugin manifest has required fields
- Component files match what's listed in plugin.json
- Names follow kebab-case convention
- No duplicate component names
- README exists and contains key information

**Provides:**

- ✓ List of passed checks
- ✗ List of failed checks with fixes
- ⚠ Warnings and recommendations
- Actionable next steps

**Example usage:**

```
/plugin-builder:validate
```

## Builder Skills

The plugin-builder includes specialized builder skills for each Claude Code component type. These skills are invoked automatically by the `/add` and `/edit` commands to provide expert guidance following industry best practices.

### `cc-skill-builder`

Claude Code Skill Builder - Expert guidance for creating highly effective Claude Code skills.

**Provides:**

- Skill structure (YAML frontmatter + markdown content)
- Effective prompt engineering techniques
- Tool permission optimization
- Progressive disclosure patterns
- Resource organization (scripts, references, assets)
- Common skill patterns and workflows

**Based on:** [Claude Skills Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)

### `cc-command-builder`

Slash Command Builder - Expert guidance for creating slash commands.

**Provides:**

- Markdown structure with optional YAML frontmatter
- Argument handling ($ARGUMENTS vs positional parameters)
- Tool permissions and security
- Bash execution and file references
- Prompt engineering for commands

**Based on:** [Claude Code Slash Commands Docs](https://docs.claude.com/en/docs/claude-code/slash-commands)

### `cc-agent-builder`

Subagent Builder - Expert guidance for creating specialized subagents.

**Provides:**

- System prompt design
- Context isolation strategies
- Tool permissions (inherit vs explicit)
- Model selection guidance
- Workflow and success criteria definition

**Based on:** [Claude Code Subagents Docs](https://docs.claude.com/en/docs/claude-code/sub-agents)

### `cc-hook-builder`

Hook Builder - Expert guidance for creating workflow automation hooks.

**Provides:**

- Hook event selection (PreToolUse, PostToolUse, etc.)
- Matcher configuration for targeting tools
- Shell script creation with jq parsing
- Blocking vs non-blocking operations
- Security best practices

**Based on:** [Claude Code Hooks Guide](https://docs.claude.com/en/docs/claude-code/hooks-guide)

### `cc-mcp-builder`

MCP Server Configuration Builder - Expert guidance for configuring MCP servers.

**Provides:**

- Transport type selection (HTTP, stdio, SSE)
- Environment variable handling
- Authentication configuration
- Scope selection (project vs user)
- Platform-specific considerations

**Based on:** [Claude Code MCP Docs](https://docs.claude.com/en/docs/claude-code/mcp)

### How Builder Skills Work

Builder skills follow the [Anthropic Context Engineering Guide](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) principles:

1. **Progressive Disclosure** - Information revealed incrementally as needed
2. **Minimal Context** - Only essential details in frontmatter, detailed guidance on invocation
3. **Tool Efficiency** - Curated minimal tool sets for each builder
4. **Structured Guidance** - Clear step-by-step workflows
5. **Best Practices** - Industry-standard patterns and anti-patterns

When you use `/plugin-builder:add` or `/plugin-builder:edit`, the appropriate builder skill is automatically invoked to guide you through creation or modification with expert knowledge specific to that component type.

## Component Types

### Slash Commands

Custom shortcuts invoked as `/plugin-name:command-name`. Use for frequently-used operations, scaffolding, or complex workflows.

### Agents (Subagents)

Specialized agents for specific development tasks. They can have restricted tool access and custom prompts optimized for their purpose.

### Hooks

Behavior customizations that run at key workflow points (before user input, before/after tool calls, agent start/end).

### Skills

Domain-specific expertise that can be invoked when needed. Skills provide specialized knowledge without always being active.

### MCP Servers

Integration with Model Context Protocol servers to add external tools and data sources.

## Example Plugin Structure

This plugin itself demonstrates proper structure:

```
plugin-builder/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest
├── commands/
│   ├── init.md                  # Init command
│   ├── add.md                   # Add command (routes to builder skills)
│   ├── edit.md                  # Edit command (routes to builder skills)
│   └── validate.md              # Validate command
├── skills/
│   ├── cc-skill-builder.md      # Skill builder
│   ├── cc-command-builder.md    # Slash command builder
│   ├── cc-agent-builder.md      # Subagent builder
│   ├── cc-hook-builder.md       # Hook builder
│   └── cc-mcp-builder.md        # MCP server builder
├── CODEOWNERS                   # Maintainers
├── LICENSE                      # MIT License
└── README.md                    # This file
```

## Best Practices

When creating plugins with this tool:

1. **Write detailed prompts** - The quality of your plugin depends on clear, comprehensive instructions
2. **Include examples** - Show expected behavior and usage patterns
3. **Handle edge cases** - Think about what could go wrong and address it
4. **Use proper naming** - Always use kebab-case for component names
5. **Provide clear descriptions** - Help users understand what each component does
6. **Add keywords** - Improve discoverability in marketplaces
7. **Test before publishing** - Use `/plugin-builder:validate` to check for issues

## Plugin Manifest Reference

The plugin.json file structure:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "What this plugin does",
  "author": "Your Name",
  "license": "MIT",
  "keywords": ["relevant", "keywords"],
  "commands": [
    {
      "name": "command-name",
      "description": "What the command does"
    }
  ],
  "agents": [
    {
      "name": "agent-name",
      "description": "What the agent does"
    }
  ],
  "hooks": [
    {
      "name": "hook-name",
      "description": "What the hook does"
    }
  ],
  "skills": [
    {
      "name": "skill-name",
      "description": "What the skill does"
    }
  ],
  "mcpServers": [
    {
      "name": "server-name",
      "description": "What the server provides"
    }
  ]
}
```

## Contributing to Claude Market

Once you've created and validated your plugin:

1. Test it locally: `/plugin install ./{plugin-name}`
2. Ensure validation passes: `/plugin-builder:validate`
3. Submit to Claude Market by creating a PR that adds your plugin to `.claude-plugin/marketplace.json`
4. The CODEOWNERS file ensures proper review by maintainers and plugin authors

## License

MIT

## Learn More

- [Claude Code Plugins Documentation](https://docs.claude.com/en/docs/claude-code/plugins)
- [Plugin Marketplaces](https://docs.claude.com/en/docs/claude-code/plugin-marketplaces)
- [Claude Code](https://claude.com/claude-code)
