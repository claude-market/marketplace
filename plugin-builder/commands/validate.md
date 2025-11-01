---
description: Validate plugin structure and configuration
---

You are validating a Claude Code plugin's structure and configuration.

## Step 1: Select Plugin

Ask the user which plugin to validate, or use Glob to find all plugins in `./*/.claude-plugin/plugin.json` and let them choose.

## Step 2: Validation Checks

Perform these validation checks:

### Structure Validation

1. **Required files exist:**

   - `.claude-plugin/plugin.json` must exist
   - `CODEOWNERS` must exist
   - At least one component directory should have content

2. **Directory structure:**
   - `commands/` for commands (optional - only if commands exist)
   - `agents/` for agents (optional - only if agents exist)
   - `hooks/` for hooks (optional - only if hooks exist)
   - `skills/` for skills (optional - only if skills exist)
   - `mcp-servers/` for MCP servers (optional - only if MCP servers exist)

3. **CODEOWNERS validation:**
   - File exists at plugin root
   - Contains @claude-market
   - Contains at least one GitHub username
   - Format is valid (pattern: * @org @user name)

### Plugin Manifest Validation

Read and validate `.claude-plugin/plugin.json`:

1. **Required fields:**

   - `name` (string, kebab-case)
   - At least one of: `commands`, `agents`, `hooks`, `skills`, `mcpServers`

2. **Optional but recommended fields:**

   - `version` (semantic versioning)
   - `description` (clear, concise)
   - `author`
   - `license`
   - `keywords` (array of strings)

3. **Component arrays format:**

   - Each command should have `name` and `description`
   - Each agent should have `name` and `description`
   - Each hook should have `name` and `description`
   - Each skill should have `name` and `description`
   - Each mcpServer should have `name` and `description`

4. **JSON validity:**
   - Properly formatted JSON
   - No syntax errors

### Component File Validation

For each component listed in plugin.json, verify:

1. **Commands:**

   - File exists at `commands/{name}.md`
   - Contains frontmatter with description
   - Has meaningful content (not empty)
   - Uses proper markdown formatting

2. **Agents:**

   - File exists at `agents/{name}.md`
   - Contains clear instructions
   - Defines specialized purpose
   - Has meaningful content

3. **Hooks:**

   - File exists at `hooks/{name}.json`
   - Valid JSON format
   - Contains required hook configuration
   - Hook type is valid

4. **Skills:**

   - File exists at `skills/{name}.md`
   - Defines domain expertise
   - Contains clear usage instructions
   - Has meaningful content

5. **MCP Servers:**
   - File exists at `mcp-servers/{name}.json`
   - Valid JSON format
   - Contains connection configuration

### Content Quality Checks

1. **Names are kebab-case:** Check all component names
2. **Descriptions are present and clear:** Not empty or placeholder text
3. **No duplicate names:** Across all components
4. **Files have substantial content:** Not just placeholders

### Documentation Validation

1. **README.md exists**
2. **README contains:**
   - Plugin name and description
   - Installation instructions
   - Usage examples for components
   - License information
3. **LICENSE file exists**

## Step 3: Report Results

Create a structured validation report:

### ✓ Passed Checks

List all checks that passed

### ✗ Failed Checks

List all checks that failed with:

- What failed
- Why it's a problem
- How to fix it

### ⚠ Warnings

List recommendations for improvement:

- Missing optional fields
- Content that could be more detailed
- Best practices not followed

## Step 4: Recommendations

Provide actionable recommendations:

- Critical fixes needed before the plugin can work
- Suggested improvements for better user experience
- Best practices to follow

## Example Output:

```
Validating plugin: awesome-plugin

✓ Passed Checks:
  - Plugin manifest exists
  - All required fields present
  - JSON is valid
  - All listed commands have corresponding files
  - Directory structure is correct
  - CODEOWNERS file exists and is valid
  - README.md exists
  - LICENSE file exists

✗ Failed Checks:
  - Command "broken-cmd" listed in plugin.json but file not found at commands/broken-cmd.md
    Fix: Create the missing command file or remove it from plugin.json

⚠ Warnings:
  - No version specified in plugin.json (recommended for tracking)
  - Command "init" has minimal description (could be more detailed)
  - No keywords specified (helps with discoverability)
  - CODEOWNERS doesn't include @claude-market (should be added for marketplace submissions)

Recommendations:
  1. Add version field to plugin.json (suggest starting at "1.0.0")
  2. Expand command descriptions to be more informative
  3. Add relevant keywords for marketplace discoverability
  4. Consider adding usage examples to README
```

Be thorough but constructive in validation feedback.
