# Plugin Builder

Interactive plugin builder for Claude Code - serves as both an example plugin and a tool to create new plugins through guided prompts.

## Overview

The Plugin Builder helps you create high-quality Claude Code plugins through an interactive, question-based workflow. It handles all the scaffolding and ensures your plugins follow best practices.

## Features

- **Guided plugin creation** - Interactive prompts walk you through creating any type of component
- **Multi-component support** - Create commands, agents, hooks, skills, and MCP servers in one session
- **Best practices built-in** - Generates well-structured, comprehensive prompts automatically
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

Add a new component to an existing plugin.

**Use this when:**

- You already have a plugin and want to add another command, agent, hook, skill, or MCP server
- You want to expand your plugin's functionality

**Workflow:**

1. Select which plugin to add to
2. Choose component type to add
3. Answer questions about the new component
4. Generates the component file
5. Updates plugin.json and README

**Example usage:**

```
/plugin-builder:add
```

### `/plugin-builder:edit`

Use natural language to make edits to your existing plugin components.

**Use this when:**

- You want to modify an existing command, agent, hook, skill, or MCP server
- You need to update functionality, fix issues, or refactor a component
- You want to make changes using conversational descriptions instead of manual file editing

**Workflow:**

1. Select which plugin to edit
2. Choose which component to modify
3. Describe your desired changes in natural language
4. Claude interprets your intent and applies the edits
5. Review the changes and confirm
6. Optionally update README and version number

**Example natural language edits:**

- "Add validation for email addresses"
- "Make it ask for confirmation before deleting"
- "Change the default model from haiku to sonnet"
- "Add better error handling"
- "Include usage examples in the documentation"

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

## Skills

### `cc-skill-builder`

Claude Code Skill Builder - Makes Claude an expert at creating highly effective Claude Code skills.

**When invoked:**

This skill activates automatically when users ask to create a new Claude Code skill. It provides comprehensive guidance on:

- Skill structure (YAML frontmatter + markdown content)
- Effective prompt engineering techniques
- Tool permission optimization
- Progressive disclosure patterns
- Resource organization (scripts, references, assets)
- Common skill patterns and workflows
- Best practices and pitfalls to avoid

**Based on industry best practices from:**
- [Claude Skills Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)

**What it helps you create:**

- Skills with clear, action-oriented descriptions for proper invocation
- Optimized prompts under 5,000 words using imperative voice
- Minimal tool permissions for security
- Supporting resources (Python/Bash scripts, reference docs, templates)
- Skills following one of five proven patterns:
  - Script Automation
  - Read-Process-Write
  - Search-Analyze-Report
  - Command Chain Execution
  - Wizard-Style Workflows

**Example usage:**

Simply ask Claude to create a skill, and this skill will automatically activate:

```
Can you help me create a skill for analyzing Python code performance?
```

Claude will guide you through:
1. Gathering requirements
2. Designing effective frontmatter
3. Structuring comprehensive instructions
4. Optimizing for context efficiency
5. Creating supporting resources if needed

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
│   └── plugin.json           # Plugin manifest
├── commands/
│   ├── init.md               # Init command
│   ├── add.md                # Add command
│   ├── edit.md               # Edit command
│   └── validate.md           # Validate command
├── skills/
│   └── cc-skill-builder.md   # Skill builder skill
├── LICENSE                   # MIT License
└── README.md                 # This file
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
