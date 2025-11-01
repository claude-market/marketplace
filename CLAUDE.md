# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is the Claude Market marketplace repository - a hand-curated collection of open source Claude Code plugins (tools, agents, skills, and MCP servers). This marketplace enables centralized discovery and distribution of Claude Code extensions.

## Marketplace Structure

### Core File: `.claude-plugin/marketplace.json`

The marketplace is defined by a JSON file at `.claude-plugin/marketplace.json` in the repository root. This file contains:

- **name**: Kebab-case identifier for the marketplace
- **owner**: Maintainer information object with contact details
- **plugins**: Array of plugin entries available in this marketplace
- **description** (optional): Description of the marketplace's purpose
- **version** (optional): Marketplace version
- **pluginRoot** (optional): Default root directory for relative plugin paths

### Plugin Entry Schema

Each plugin in the `plugins` array must include:

**Required fields:**

- `name`: Kebab-case identifier for the plugin
- `source`: Where to fetch the plugin (relative path, GitHub repo, or git URL)

**Optional metadata:**

- `description`: What the plugin does
- `version`: Plugin version
- `author`: Author name or organization
- `homepage`: Plugin homepage URL
- `repository`: Source repository URL
- `license`: License type
- `keywords`: Array of searchable keywords

**Component configuration:**

- `commands`: Slash commands included
- `agents`: Subagents included
- `hooks`: Hooks included
- `mcpServers`: MCP servers included

### Source Types

Plugins can be sourced from:

- **Relative paths**: `"./plugin-name"` (top-level directory in marketplace)
- **GitHub repos**: `{"source": "github", "repo": "owner/repo"}`
- **Git URLs**: `{"source": "url", "url": "https://example.com/plugin.git"}`

## Curation Standards

Since this is a hand-curated marketplace:

1. **Quality over quantity**: Only include well-tested, valuable plugins
2. **Accurate metadata**: Ensure all plugin descriptions, keywords, and component lists are accurate
3. **Working sources**: Verify all plugin sources are accessible and functional
4. **License compliance**: Confirm all plugins have appropriate open source licenses
5. **Documentation**: Plugins should have clear documentation on usage

## Installation by Users

Users install this marketplace with:

```
/plugin marketplace add claude-market/marketplace
```

Then browse and install individual plugins through the `/plugin` menu in Claude Code.

## Repository Structure

```
marketplace/
├── .claude-plugin/
│   └── marketplace.json      # Marketplace manifest listing all plugins
├── .github/
│   ├── ISSUE_TEMPLATE/       # Issue templates for bug reports, feature requests
│   └── pull_request_template.md
├── plugin-builder/           # Official plugin builder tool (top-level)
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── commands/             # init, add, validate commands
│   ├── CODEOWNERS            # Maintainers and reviewers
│   ├── LICENSE
│   └── README.md
├── {plugin-name}/            # Community plugins at top level
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── commands/             # optional
│   ├── agents/               # optional
│   ├── hooks/                # optional
│   ├── skills/               # optional
│   ├── mcp-servers/          # optional
│   ├── CODEOWNERS            # Required - maintainers and reviewers
│   ├── README.md
│   └── LICENSE
├── CLAUDE.md                 # This file
├── CONTRIBUTING.md           # Contribution guidelines
└── README.md                 # Main documentation
```

## Plugin Builder

The `plugin-builder` plugin is the official tool for creating new plugins for this marketplace. It provides:

- `/plugin-builder:init` - Interactive plugin creation with guided prompts
- `/plugin-builder:add` - Add components to existing plugins
- `/plugin-builder:validate` - Validate plugin structure and configuration

When creating new plugins, always use the plugin-builder to ensure proper structure and quality.

## Adding New Plugins to Marketplace

When adding a new plugin to the marketplace:

1. Plugin must be at the top level: `./{plugin-name}/` directory
2. Plugin must have valid `.claude-plugin/plugin.json` manifest
3. Plugin must have CODEOWNERS file with @claude-market and plugin author
4. Plugin must have README.md and LICENSE
5. Component directories (commands/, agents/, hooks/, skills/, mcp-servers/) are optional - only create if needed
6. Add plugin entry to `.claude-plugin/marketplace.json` with source path `"./{plugin-name}"`
7. Ensure plugin passes validation: `/plugin-builder:validate`

## Plugin Directory Structure

Plugins follow this structure (all component directories are optional):

```
{plugin-name}/
├── .claude-plugin/
│   └── plugin.json          # Required
├── commands/                # Optional - only if commands exist
│   └── *.md
├── agents/                  # Optional - only if agents exist
│   └── *.md
├── hooks/                   # Optional - only if hooks exist
│   └── *.json
├── skills/                  # Optional - only if skills exist
│   └── *.md
├── mcp-servers/             # Optional - only if MCP servers exist
│   └── *.json
├── CODEOWNERS               # Required - defines maintainers
├── README.md                # Required
└── LICENSE                  # Required
```

## Plugin Components

Plugins can bundle four types of extensions:

- **Slash commands**: Custom shortcuts for frequently-used operations
- **Subagents**: Specialized agents for specific development tasks
- **MCP servers**: Tools and data sources via Model Context Protocol
- **Hooks**: Behavior customizations at key workflow points
- **Skills**: Domain-specific expertise invoked when needed
