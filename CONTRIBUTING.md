# Contributing to Claude Market

Thank you for your interest in contributing to Claude Market! This guide will help you submit high-quality plugins to the marketplace.

## Table of Contents

- [Getting Started](#getting-started)
- [Plugin Requirements](#plugin-requirements)
- [Submission Process](#submission-process)
- [Review Criteria](#review-criteria)
- [Best Practices](#best-practices)
- [Testing Your Plugin](#testing-your-plugin)

## Getting Started

### Use the Plugin Builder

The easiest way to create a plugin is using our plugin-builder tool:

1. Clone this repository:
   ```bash
   git clone https://github.com/claude-market/marketplace.git
   cd marketplace
   ```

2. Install the plugin-builder:
   ```bash
   /plugin install ./plugin-builder
   ```

3. Create your plugin:
   ```bash
   /plugin-builder:init
   ```
   - Enter your GitHub username and author name when prompted
   - This creates `./{plugin-name}/` directory at the top level
   - Follow the interactive prompts

4. The tool will guide you through creating:
   - Plugin metadata (name, description, license)
   - Components (commands, agents, hooks, skills, MCP servers)
   - Comprehensive prompt files
   - Plugin manifest (plugin.json)
   - README with examples

### Manual Creation

If you prefer to create plugins manually, ensure you follow the structure in [Plugin Requirements](#plugin-requirements).

## Plugin Requirements

### Directory Structure

Plugins are placed at the top level of the repository:

```
your-plugin-name/
├── .claude-plugin/
│   └── plugin.json          # Required: Plugin manifest
├── commands/                # Optional: Slash commands
│   └── command.md
├── agents/                  # Optional: Agents
│   └── agent.md
├── hooks/                   # Optional: Hooks
│   └── hook.json
├── skills/                  # Optional: Skills
│   └── skill.md
├── mcp-servers/             # Optional: MCP servers
│   └── server.json
├── CODEOWNERS               # Required: Maintainers and reviewers
├── README.md                # Required: Documentation
└── LICENSE                  # Required: Open source license
```

### plugin.json Schema

Your `.claude-plugin/plugin.json` must include:

**Required:**
- `name` (string, kebab-case)
- At least one of: `commands`, `agents`, `hooks`, `skills`, or `mcpServers`

**Recommended:**
- `version` (string, semantic versioning)
- `description` (string, clear and concise)
- `author` (string)
- `license` (string)
- `keywords` (array of strings)
- `homepage` (string, URL)
- `repository` (string, URL)

**Example:**
```json
{
  "name": "my-awesome-plugin",
  "version": "1.0.0",
  "description": "Does awesome things with Claude Code",
  "author": "Your Name",
  "license": "MIT",
  "keywords": ["productivity", "automation", "development"],
  "homepage": "https://github.com/username/plugin",
  "repository": "https://github.com/username/plugin",
  "commands": [
    {
      "name": "do-thing",
      "description": "Does a specific thing"
    }
  ]
}
```

### CODEOWNERS File

Every plugin must include a CODEOWNERS file at its root. This file defines who should review changes to the plugin.

**Format:**
```
# Plugin maintainers and reviewers
* @claude-market @your-github-username Your Name
```

**Example:**
```
# Plugin maintainers and reviewers
* @claude-market @danielkov danielkov
```

This ensures:
- The Claude Market organization (@claude-market) is notified of all changes
- Your GitHub account (@your-username) is tagged as a reviewer
- Your name is listed for visibility

### README Requirements

Your README.md should include:

1. **Plugin name and description**
2. **Installation instructions**
   ```bash
   /plugin install plugin-name
   ```
3. **Component documentation**:
   - List all commands, agents, hooks, skills, and MCP servers
   - Usage examples for each
   - Expected behavior
4. **Requirements** (if any):
   - Dependencies
   - Environment variables
   - External tools needed
5. **License information**

### Component Requirements

#### Commands (commands/*.md)

- Include frontmatter with description
- Clear, step-by-step instructions
- Specify which tools to use
- Handle edge cases
- Include examples

**Example:**
```markdown
---
description: Creates a new React component with tests
---

You are helping create a React component.

## Step 1: Collect Information
Ask the user for:
- Component name (PascalCase)
- Component type (functional/class)

## Step 2: Create Component File
[Detailed instructions...]
```

#### Agents (agents/*.md)

- Include frontmatter with name, description, and model
- Define specialized role clearly
- Provide workflow steps
- Specify tool usage
- Include success criteria

**Example:**
```markdown
---
name: test-fixer
description: Fixes failing tests
model: sonnet
---

You are a specialized agent for fixing failing tests.

## Your Role
[Detailed role description...]
```

#### Hooks (hooks/*.json)

- Valid JSON
- Include name, type, description, command
- Safe shell commands only
- Non-intrusive behavior

**Example:**
```json
{
  "name": "pre-commit-check",
  "type": "user-prompt-submit",
  "description": "Checks code before committing",
  "command": "npm run lint",
  "blockOnFailure": false
}
```

#### Skills (skills/*.md)

- Define domain expertise
- List specific capabilities
- Explain when to use
- Include best practices
- Provide examples

#### MCP Servers (mcp-servers/*.json)

- Valid JSON
- Include connection details
- Document required environment variables
- Specify provided tools/resources

## Submission Process

### 1. Prepare Your Plugin

- Create plugin in `./{plugin-name}/` (top-level directory)
- Ensure all requirements are met (including CODEOWNERS file)
- Test thoroughly

### 2. Validate

Use the plugin-builder validator:
```bash
/plugin-builder:validate
```

Address any issues found.

### 3. Test Locally

Install and test your plugin:
```bash
/plugin install ./{plugin-name}
```

Try all commands, agents, hooks, skills, and MCP servers to ensure they work correctly.

### 4. Update marketplace.json

Add your plugin entry to `.claude-plugin/marketplace.json`:

```json
{
  "name": "your-plugin-name",
  "source": "./your-plugin-name",
  "version": "1.0.0",
  "description": "Clear description",
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

Copy the metadata from your plugin.json.

### 5. Create Pull Request

- Fork the repository
- Create a branch: `git checkout -b add-your-plugin-name`
- Commit your changes
- Push to your fork
- Open a pull request

**PR Description should include:**
- What your plugin does
- What components it provides
- Usage examples or screenshots
- Any special requirements

### 6. Review Process

Maintainers will review your submission for:
- Code quality and safety
- Documentation completeness
- Component functionality
- Adherence to guidelines
- Overall usefulness

We may request changes. Once approved, your plugin will be merged!

## Review Criteria

### Must Have
- ✓ All files present and properly structured
- ✓ CODEOWNERS file with @claude-market and plugin author
- ✓ Valid JSON in all .json files
- ✓ Clear documentation in README
- ✓ Open source license
- ✓ Components work as described
- ✓ No security vulnerabilities
- ✓ No malicious code

### Quality Indicators
- ✓ Comprehensive component prompts
- ✓ Edge case handling
- ✓ Usage examples
- ✓ Clear naming (kebab-case)
- ✓ Helpful error messages
- ✓ Follows best practices
- ✓ Well-tested

### Grounds for Rejection
- ✗ Malicious code or security issues
- ✗ Plagiarism or copyright violation
- ✗ Incomplete or missing documentation
- ✗ Components don't work
- ✗ Poor quality or unclear instructions
- ✗ Violates terms of service

## Best Practices

### Writing Great Commands

1. **Be specific**: Clear, unambiguous instructions
2. **Be comprehensive**: Cover the full workflow
3. **Be helpful**: Include examples and explanations
4. **Handle errors**: Anticipate what could go wrong
5. **Use appropriate tools**: Read, Edit, Grep, Glob, Bash, etc.

### Writing Great Agents

1. **Define clear role**: What specialized task?
2. **Provide workflow**: Step-by-step approach
3. **Specify tools**: Which tools are most relevant?
4. **Include examples**: Show typical usage patterns
5. **Choose right model**: Haiku for speed, Sonnet for complexity

### Writing Great Skills

1. **Define expertise**: What domain knowledge?
2. **List capabilities**: Specific things it can do
3. **Explain usage**: When to invoke this skill
4. **Include patterns**: Common approaches
5. **Provide examples**: Real-world scenarios

### General Tips

- **Test thoroughly** before submitting
- **Write clear documentation** with examples
- **Follow conventions** (kebab-case, semantic versioning)
- **Keep it focused** - one plugin should do one thing well
- **Think about users** - make it easy to understand and use

## Testing Your Plugin

### Basic Tests

1. **Structure test**: Does it have all required files?
2. **JSON validation**: Are all JSON files valid?
3. **Installation test**: Can it be installed with `/plugin install`?
4. **Functionality test**: Do all components work as documented?

### Manual Testing Checklist

- [ ] Install plugin locally
- [ ] Try each command - does it work?
- [ ] Invoke each agent - does it perform correctly?
- [ ] Trigger each hook - does it behave as expected?
- [ ] Use each skill - does it provide the right expertise?
- [ ] Connect each MCP server - does it provide the tools?
- [ ] Check error handling - what happens with invalid input?
- [ ] Review output - is it helpful and clear?

### Using the Validator

```bash
/plugin-builder:validate
```

This checks:
- File structure
- plugin.json validity
- Component file existence
- Naming conventions
- Documentation presence

## Questions?

- Open an issue: [GitHub Issues](https://github.com/claude-market/marketplace/issues)
- Start a discussion: [GitHub Discussions](https://github.com/claude-market/marketplace/discussions)
- Read the docs: [Claude Code Plugin Documentation](https://docs.claude.com/en/docs/claude-code/plugins)

## License

By contributing, you agree that your contributions will be licensed under the same license as your plugin (as specified in your plugin's LICENSE file).

Thank you for contributing to Claude Market!
