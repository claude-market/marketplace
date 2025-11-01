---
description: Use natural language to make edits to your existing tools
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

Use AskUserQuestion to ask what type of edit they want to make:

- **Modify behavior**: Change what the component does or how it works
- **Update description**: Change the component's description or documentation
- **Add functionality**: Extend the component with new capabilities
- **Refactor structure**: Reorganize the component's structure or workflow
- **Fix issues**: Correct bugs or problems in the component
- **Other**: Custom edit (user will describe)

## Step 6: Collect Edit Details

Ask the user to describe their desired changes in natural language:

**Prompt**: "Please describe the changes you want to make to this component. Be as specific or general as you like - I'll interpret your intent and apply the appropriate edits."

The user might say things like:
- "Add validation for email addresses"
- "Make it ask for confirmation before deleting"
- "Change the default model from haiku to sonnet"
- "Add better error handling"
- "Include examples in the documentation"
- "Make it work with TypeScript files too"

## Step 7: Apply the Edits

Based on the user's natural language description:

1. **Analyze the current component** to understand its structure
2. **Interpret the user's intent** from their description
3. **Plan the changes** needed (you can think through this step)
4. **Apply the edits** using the Edit tool to modify the component file

For different component types:

### Editing Commands (.md files):
- Modify the frontmatter `description` if the purpose changed
- Update step-by-step instructions
- Add/remove/modify tool usage guidance
- Include or update examples
- Adjust workflow steps
- Add edge case handling

### Editing Agents (.md files):
- Update agent role definition
- Modify available tools list
- Change default model recommendation
- Adjust workflow steps
- Update success criteria
- Add or remove capabilities

### Editing Hooks (.json files):
- Modify hook type or trigger conditions
- Update the command to execute
- Change blocking behavior
- Adjust environment variables
- Update hook description

### Editing Skills (.md files):
- Update domain expertise description
- Add or remove capabilities
- Modify usage patterns
- Update best practices
- Change tool requirements

### Editing MCP Servers (.json files):
- Update connection details
- Modify environment variables
- Change server configuration
- Update tool/resource definitions

## Step 8: Verify Changes

After applying edits:

1. **Read the updated component** to show the user what changed
2. **Validate the changes**:
   - Ensure the file structure is still correct
   - Check that required fields are present
   - Verify syntax (especially for JSON files)
3. **Ask for confirmation**: Show a summary of changes and ask if they look correct

## Step 9: Update Plugin Metadata (If Needed)

Determine if the edit requires updating other files:

- **If component description changed significantly**: Offer to update the README.md
- **If functionality changed**: Offer to update the plugin.json description or keywords
- **If the edit is substantial**: Offer to increment the version number (patch bump)

Use AskUserQuestion to ask if they want to update these related files.

## Step 10: Apply Additional Updates

If the user agreed to update related files:

### Update README:
- Find the section documenting this component
- Update the usage examples or description
- Ensure it reflects the new behavior

### Update Plugin.json:
- Increment version (e.g., 1.0.0 → 1.0.1 for patch changes)
- Update keywords if new functionality was added
- Update description if plugin's overall purpose expanded

## Step 11: Summary

Provide the user with a clear summary:

- **Component edited**: Name and file path
- **Changes made**: Concise summary of what was modified
- **Files updated**: List all files that were changed (component + README/manifest if applicable)
- **New version**: If version was bumped
- **Testing recommendation**: Suggest how to test the changes (e.g., `/plugin-builder:edit` to test the edit command)

## Important Guidelines:

### Interpreting Natural Language:
- **Be intelligent about intent**: If user says "make it faster", interpret this based on context (use haiku model, optimize steps, etc.)
- **Ask for clarification** if the request is genuinely ambiguous
- **Make reasonable assumptions** for small details, but confirm major changes
- **Preserve existing functionality** unless explicitly asked to remove it

### Edit Best Practices:
- **Make surgical changes**: Only modify what's necessary
- **Preserve formatting**: Maintain the existing markdown/JSON style
- **Keep consistency**: Match the style of the original component
- **Test mentally**: Think through whether your edits will work as intended
- **Respect the component's purpose**: Don't change what the component fundamentally does unless explicitly asked

### Validation:
- **For .md files**: Ensure frontmatter is valid, markdown is well-formed
- **For .json files**: Validate JSON syntax, ensure required fields are present
- **For paths**: Ensure any file paths referenced still exist and are correct
- **For tool usage**: Ensure tools referenced in prompts actually exist

### Communication:
- **Show before/after** for significant changes
- **Explain your interpretation** of their natural language request
- **Highlight any assumptions** you made
- **Offer to refine** if the edit wasn't quite what they wanted

## Example Interaction Flow:

1. Find plugins → user selects "plugin-builder"
2. Read plugin.json → show components: init, add, validate commands
3. User selects → "add command"
4. Read component → display current add.md implementation summary
5. Ask edit type → user selects "Add functionality"
6. User describes → "Make it support creating multiple components at once"
7. Apply edits → Modify the workflow to handle multiple component creation
8. Show changes → Display updated sections of add.md
9. Ask about updates → Offer to update README with new capability
10. Update README → Add example of creating multiple components
11. Version bump → Increment to 1.0.1
12. Summary → List all changes and how to test

## Edge Cases to Handle:

- **Component doesn't exist**: Guide user back to component selection
- **Invalid edit request**: Ask for clarification if request doesn't make sense
- **Conflicting changes**: Warn if edit might break existing functionality
- **Syntax errors**: Fix any syntax issues introduced during editing
- **Multiple files**: If component spans multiple files, edit all relevant ones

Begin by finding available plugins and asking which one to edit!