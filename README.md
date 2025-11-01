# Claude Market

Hand-curated open source repository for Claude Code plugins - tools, agents, skills, and MCP servers that extend Claude Code's capabilities.

## What is Claude Market?

Claude Market is a plugin marketplace for [Claude Code](https://claude.com/claude-code), providing a curated collection of high-quality extensions built by the community. Each plugin is reviewed for quality, documentation, and usefulness.

## Installation

Add this marketplace to your Claude Code:

```bash
/plugin marketplace add claude-market/marketplace
```

Then browse available plugins:

```bash
/plugin
```

## Available Plugins

### Plugin Builder

Interactive tool for creating new Claude Code plugins through guided prompts.

**Features:**

- Create plugins with commands, agents, hooks, skills, and MCP servers
- Step-by-step prompts collect all necessary information
- Generates comprehensive, well-structured component files
- Validates plugin structure and configuration
- Serves as an example of plugin best practices

**Install:**

```bash
/plugin install plugin-builder
```

**Learn more:** [plugin-builder/README.md](./plugin-builder/README.md)

## Contributing a Plugin

We welcome high-quality plugin contributions! Here's how to submit yours:

### Prerequisites

1. Your plugin should be well-tested and functional
2. Include comprehensive documentation (README.md)
3. Follow plugin structure best practices
4. Have appropriate open source license

### Quick Start: Use Plugin Builder

The easiest way to create a plugin for this marketplace:

1. Install the plugin-builder:

   ```bash
   /plugin install ./plugin-builder
   ```

2. Create your plugin:

   ```bash
   /plugin-builder:init
   ```

   Follow the prompts to create your plugin as a top-level directory

3. Validate your plugin:

   ```bash
   /plugin-builder:validate
   ```

4. Test locally:
   ```bash
   /plugin install ./{plugin-name}
   ```

### Submission Process

1. **Fork this repository**

2. **Add your plugin** as a top-level directory:

   ```
   your-plugin/
   ├── .claude-plugin/
   │   └── plugin.json
   ├── commands/           # optional - only if you have commands
   ├── agents/             # optional - only if you have agents
   ├── hooks/              # optional - only if you have hooks
   ├── skills/             # optional - only if you have skills
   ├── mcp-servers/        # optional - only if you have MCP servers
   ├── CODEOWNERS          # required - defines reviewers
   ├── README.md
   └── LICENSE
   ```

3. **Add your plugin to marketplace.json**:

   Edit `.claude-plugin/marketplace.json` and add your plugin entry:

   ```json
   {
     "name": "your-plugin-name",
     "source": "./your-plugin",
     "version": "1.0.0",
     "description": "Clear description of what your plugin does",
     "author": "Your Name",
     "license": "MIT",
     "keywords": ["relevant", "keywords"],
     "commands": [...],
     "agents": [...],
     "hooks": [...],
     "skills": [...],
     "mcpServers": [...]
   }
   ```

4. **Create a pull request** with:

   - Clear description of what your plugin does
   - Screenshots or examples if applicable
   - Any special requirements or dependencies

5. **Review process**:
   - Maintainers will review for quality, documentation, and functionality
   - May request changes or improvements
   - Once approved, your plugin will be merged and available to all users

## Plugin Quality Standards

To maintain a high-quality marketplace, submissions should meet these criteria:

### Required

- Clear, comprehensive README with usage examples
- Valid plugin.json with complete metadata
- All components work as documented
- Open source license (MIT, Apache 2.0, GPL, etc.)
- No malicious code or security vulnerabilities

### Recommended

- Detailed descriptions for all components
- Examples showing typical usage
- Edge case handling
- Keywords for discoverability
- Version number following semantic versioning

### Plugin Structure

Every plugin must have:

- `.claude-plugin/plugin.json` - Plugin manifest
- `CODEOWNERS` - Defines maintainers and reviewers
- `README.md` - Documentation
- `LICENSE` - Open source license
- At least one component (command, agent, hook, skill, or MCP server)

Component files go in (directories are optional - only create if you have that component type):

- `commands/*.md` - Slash commands
- `agents/*.md` - Agents
- `hooks/*.json` - Hooks
- `skills/*.md` - Skills
- `mcp-servers/*.json` - MCP server configs

## Plugin Ideas

Looking for inspiration? Here are plugin ideas the community would love:

### Development Tools

- Framework-specific helpers (React, Vue, Next.js, etc.)
- Testing utilities (generate tests, fix failing tests)
- Code quality tools (linting, formatting, refactoring)
- Git workflow automation
- Docker/Kubernetes helpers

### Language-Specific

- Python project scaffolding
- Go best practices
- Rust development tools
- JavaScript/TypeScript utilities

### Documentation

- API documentation generators
- README templates
- Changelog automation
- Code comment generators

### Project Management

- Issue tracker integration
- Sprint planning helpers
- Dependency update automation

### Domain-Specific

- Web scraping tools
- Data analysis helpers
- Machine learning utilities
- API client generators
- Database migration tools

## Support

- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/claude-market/marketplace/issues)
- **Discussions**: Share ideas and ask questions in [GitHub Discussions](https://github.com/claude-market/marketplace/discussions)
- **Documentation**: [Claude Code Plugin Docs](https://docs.claude.com/en/docs/claude-code/plugins)

## Resources

- [Claude Code](https://claude.com/claude-code) - Official Claude Code page
- [Plugin Documentation](https://docs.claude.com/en/docs/claude-code/plugins) - How to create plugins
- [Marketplace Documentation](https://docs.claude.com/en/docs/claude-code/plugin-marketplaces) - How marketplaces work
- [Plugin Builder](./plugin-builder) - Tool for creating plugins easily

## License

Individual plugins have their own licenses (see each plugin's LICENSE file).

The marketplace repository itself is licensed under MIT.
