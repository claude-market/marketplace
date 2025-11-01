---
description: Edit an existing component in your plugin
---

You are helping a user edit an existing component in a Claude Code plugin using natural language descriptions.

## Step 1: Select Plugin

Use Glob to find all plugins in `./*/.claude-plugin/plugin.json` and ask the user which plugin they want to edit (or let them specify a path).

## Step 2: Read Current Plugin Configuration

Read the plugin.json to understand what components exist and their current configuration.

## Step 3: List Available Components

Display all available components organized by type:

- **Commands**: List all command files with their descriptions (from frontmatter if available)
- **Agents**: List all agent files with their descriptions
- **Hooks**: List all hook configurations
- **Skills**: List all skill files with their descriptions
- **MCP Servers**: List all MCP server configurations

Use AskUserQuestion to ask which component they want to edit. Present options based on what exists in the plugin.

## Step 4: Read the Selected Component

Read the full content of the selected component file to understand its current implementation.

Display a summary of the component to the user:

- Component name and type
- Current description
- Key functionality (summarized)
- File path

## Step 5: Understand the Desired Edit

Ask the user to describe what changes they want to make in natural language.

**Prompt**: "Please describe the changes you want to make to this component. Be as specific or general as you like."

The user might say things like:

- "Add validation for email addresses"
- "Make it ask for confirmation before deleting"
- "Change the default model from haiku to sonnet"
- "Add better error handling"
- "Include examples in the documentation"
- "Make it work with TypeScript files too"
- "Update the description to be clearer"
- "Add support for multiple arguments"

## Step 6: Route to Appropriate Builder Skill

Based on the component type, route the editing task to the corresponding builder skill with context about the existing component and desired changes:

### For Slash Command:

Invoke the `cc-command-builder` skill:

```
Edit an existing Claude Code slash command with the following details:

**Existing Component:**
- Plugin: [plugin-name]
- Command name: [name]
- File path: [path]
- Current content:
[paste current content]

**Requested Changes:**
[user's description of what they want to change]

Please help apply these changes following best practices for slash commands.
```

### For Agent (Subagent):

Invoke the `cc-agent-builder` skill:

```
Edit an existing Claude Code subagent with the following details:

**Existing Component:**
- Plugin: [plugin-name]
- Agent name: [name]
- File path: [path]
- Current content:
[paste current content]

**Requested Changes:**
[user's description of what they want to change]

Please help apply these changes following best practices for subagents.
```

### For Hook:

Invoke the `cc-hook-builder` skill:

```
Edit an existing Claude Code hook with the following details:

**Existing Component:**
- Plugin: [plugin-name]
- Hook name: [name]
- File path: [path]
- Current configuration:
[paste current JSON]

**Requested Changes:**
[user's description of what they want to change]

Please help apply these changes following best practices for hooks.
```

### For Skill:

Invoke the `cc-skill-builder` skill:

```
Edit an existing Claude Code skill with the following details:

**Existing Component:**
- Plugin: [plugin-name]
- Skill name: [name]
- File path: [path]
- Current content:
[paste current content]

**Requested Changes:**
[user's description of what they want to change]

Please help apply these changes following best practices for skills.
```

### For MCP Server:

Invoke the `cc-mcp-builder` skill:

```
Edit an existing MCP server configuration with the following details:

**Existing Component:**
- Plugin: [plugin-name]
- Server name: [name]
- File path: [path]
- Current configuration:
[paste current JSON]

**Requested Changes:**
[user's description of what they want to change]

Please help apply these changes following best practices for MCP servers.
```

## Step 7: Update Plugin Metadata (If Needed)

After the builder skill completes the edits, determine if other files need updating:

- **If component description changed significantly**: Offer to update the README.md
- **If functionality changed**: Offer to update the plugin.json description or keywords
- **If the edit is substantial**: Offer to increment the version number (patch bump)

Use AskUserQuestion to ask if they want to update these related files.

## Step 8: Apply Additional Updates

If the user agreed to update related files:

### Update README:

- Find the section documenting this component
- Update the usage examples or description
- Ensure it reflects the new behavior

### Update Plugin.json:

- Increment version (e.g., 1.0.0 → 1.0.1 for patch changes)
- Update keywords if new functionality was added
- Update description if plugin's overall purpose expanded

## Step 9: Summary

Provide the user with a clear summary:

- **Component edited**: Name and file path
- **Changes made**: Concise summary of what was modified
- **Files updated**: List all files that were changed (component + README/manifest if applicable)
- **New version**: If version was bumped
- **Testing recommendation**: Suggest how to test the changes

## Important Guidelines:

### Modular Approach:

- Each component type has its own specialized builder skill
- Route editing tasks to the appropriate skill based on component type
- Builder skills understand best practices for their component type
- This ensures consistent, high-quality edits

### Interpreting Natural Language:

- **Be intelligent about intent**: If user says "make it faster", interpret based on context (use haiku model, optimize steps, etc.)
- **Ask for clarification** if the request is genuinely ambiguous
- **Make reasonable assumptions** for small details, but confirm major changes
- **Preserve existing functionality** unless explicitly asked to remove it

### Edit Best Practices:

- **Make surgical changes**: Only modify what's necessary
- **Preserve formatting**: Maintain the existing markdown/JSON style
- **Keep consistency**: Match the style of the original component
- **Test mentally**: Think through whether edits will work as intended
- **Respect the component's purpose**: Don't change what the component fundamentally does unless explicitly asked

### Validation:

- **For .md files**: Ensure frontmatter is valid, markdown is well-formed
- **For .json files**: Validate JSON syntax, ensure required fields are present
- **For paths**: Ensure any file paths referenced still exist and are correct
- **For tool usage**: Ensure tools referenced in prompts actually exist

### Communication:

- **Show before/after** for significant changes (builder skill handles this)
- **Explain interpretation** of their natural language request
- **Highlight assumptions** made during editing
- **Offer to refine** if the edit wasn't quite what they wanted

## Example Interaction Flow:

1. Find plugins → user selects "plugin-builder"
2. Read plugin.json → show components: init, add, validate, edit commands
3. User selects → "add command"
4. Read component → display current add.md implementation summary
5. User describes → "Make it use the new modular builder skill approach"
6. Route to `cc-command-builder` skill with context
7. Builder skill helps apply changes following best practices
8. Offer to update README with new capability
9. Update README if accepted
10. Version bump → Increment to next version
11. Summary → List all changes and testing instructions

## Edge Cases to Handle:

- **Component doesn't exist**: Guide user back to component selection
- **Invalid edit request**: Ask for clarification if request doesn't make sense for this component type
- **Conflicting changes**: Warn if edit might break existing functionality
- **Syntax errors**: Builder skill should catch and fix syntax issues
- **Multiple files**: If component spans multiple files (like hooks with shell scripts), edit all relevant ones

Begin by finding available plugins and asking which one to edit!
