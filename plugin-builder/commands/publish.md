# Publish Command

You are helping publish a Claude Code plugin to the Claude Market marketplace.

## Overview

This command validates changed plugins, generates the marketplace manifest, creates a semantic commit, and opens a pull request to the marketplace repository.

## Step 1: Identify Changed Plugins

Run `git diff main --name-only` to find all changed files. Parse the output to identify which plugins have been modified by looking for paths matching `{plugin-name}/.claude-plugin/plugin.json` or `{plugin-name}/*`.

Extract the unique plugin names from the changed paths.

If no plugin changes are detected, inform the user and exit.

## Step 2: Validate Changed Plugins in Parallel

For each changed plugin identified in Step 1, spawn a sub-agent using the Task tool to validate the plugin.

Use a single message with multiple Task tool calls to validate all plugins simultaneously:

```
For each plugin, spawn an agent with:
- subagent_type: "general-purpose"
- model: "haiku" (for speed)
- description: "Validate {plugin-name}"
- prompt: "Run the command `/plugin-builder:validate {plugin-name} --minimal` and return ONLY the exit code and output. The output should start with either '0' (success) or '1' (failure) followed by any error details."
```

Wait for all validation agents to complete and collect their outputs.

## Step 3: Check Validation Results

Parse each agent's output:

- If output starts with `0`: Plugin passed validation
- If output starts with `1`: Plugin failed validation

If **all** plugins pass validation (all outputs start with `0`):

- Proceed to Step 4

If **any** plugin fails validation (any output starts with `1`):

- For each failed plugin, display:
  - Plugin name
  - The full validation output (excluding the leading `1`)
- Exit the command with an error message
- Do not proceed further

## Step 4: Generate Marketplace Manifest

Run `make generate-marketplace-json` in the project root directory to update `.claude-plugin/marketplace.json`.

This script automatically reads all plugin manifests and generates the marketplace listing.

## Step 5: Create Semantic Commit Message

Analyze the changes using `git diff` to understand what was modified in each plugin.

Create a short, concise semantic commit message following this format:

- `feat({plugin-name}): {short description}` - for new features
- `fix({plugin-name}): {short description}` - for bug fixes
- `docs({plugin-name}): {short description}` - for documentation changes
- `chore({plugin-name}): {short description}` - for maintenance tasks

If multiple plugins are affected, use the most relevant plugin name or use `marketplace` as the scope.

Examples:

- `feat(browser-tools): added chromium mcp server`
- `fix(plugin-builder): corrected validation logic`
- `docs(security-toolkit): updated usage examples`

The description should be lowercase, concise, and explain **what** changed, not **how** it changed.

## Step 6: Branch Management

Check the current branch with `git branch --show-current`.

If on `main` branch:

- Attempt to get GitHub username with `git config user.github || git config user.name`
- Create branch name in format: `{github-user}/{plugin-affected}/{very-short-description}`
  - Use kebab-case for all parts
  - Keep description to 3-4 words max
  - Example: `danielkov/browser-tools/add-chromium-mcp`
- Run `git checkout -b {branch-name}` to create and switch to new branch
- Stage all changes: `git add .`
- Commit with semantic message: `git commit -m "{semantic-commit-message}"`
- Push branch: `git push -u origin {branch-name}`

If on a different branch (not main):

- Stage all changes: `git add .`
- Commit with semantic message: `git commit -m "{semantic-commit-message}"`
- Push branch: `git push`

## Step 7: Create Pull Request

Check if `gh` CLI is available by running `gh --version`.

### If `gh` CLI is available:

Read `.github/pull_request_template.md` to understand the PR template structure.

For each changed plugin, read its `.claude-plugin/plugin.json` to extract:

- Plugin name
- Author
- Version
- License
- Keywords
- Component counts (commands, agents, hooks, skills, mcpServers)

Also read the plugin's README.md for the overview and usage examples.

Fill in the PR template with:

- **Title**: Use the semantic commit message
- **Overview**: Extract from plugin README.md or describe the changes
- **Plugin Information**: Fill from plugin.json
- **Components Included**: Check the appropriate boxes and counts
- **What does this plugin do?**: Extract from README.md
- **Example Usage**: Extract from README.md or create based on components
- **Testing Checklist**: Mark relevant items as checked based on what was done
- **Documentation**: Mark relevant items as checked
- **Code Quality**: Mark relevant items as checked

Create the PR using:

```bash
gh pr create --title "{semantic-commit-message}" --body "{filled-template}"
```

Use a HEREDOC to properly format the body:

```bash
gh pr create --title "{semantic-commit-message}" --body "$(cat <<'EOF'
{filled-template-content}
EOF
)"
```

Display the PR URL to the user.

### If `gh` CLI is NOT available:

Display a message to the user:

```
✓ Changes committed and pushed successfully!

To create a pull request:
1. Visit: https://github.com/claude-market/marketplace/compare/{branch-name}
2. Fill in the PR template with the changes you made

💡 Tip: Install the GitHub CLI for automated PR creation:
   https://cli.github.com/manual/installation

Branch: {branch-name}
Commit: {semantic-commit-message}
```

## Important Notes

- Always validate plugins before publishing
- Use parallel validation for efficiency
- Generate semantic commit messages automatically
- Follow kebab-case naming for branches
- Fill PR template comprehensively
- Handle both scenarios: with/without gh CLI
- Be clear and concise in all communications

## Error Handling

If any step fails:

- Display the error clearly to the user
- Indicate which step failed
- Suggest remediation if possible
- Do not proceed to subsequent steps
