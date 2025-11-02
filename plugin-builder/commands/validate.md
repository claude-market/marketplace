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
   - Format is valid (pattern: \* @org @user name)

### Plugin Manifest Validation

Read and validate `.claude-plugin/plugin.json`:

1. **Required fields:**

   - `name` (string, kebab-case, unique identifier)
   - No other fields are strictly required

2. **Optional metadata fields:**

   - `version` (string, semantic versioning like "1.0.0")
   - `description` (string, clear and concise)
   - `author` (object with `name`, optional `email` and `url`)
   - `homepage` (string, documentation URL)
   - `repository` (string, source code URL)
   - `license` (string, license identifier like "MIT")
   - `keywords` (array of strings for discoverability)

3. **Author field format:**

   - If present, `author` must be an object with a `name` property
   - Optional properties: `email` (string), `url` (string)
   - **Correct format:** `"author": {"name": "John Doe", "email": "john@example.com", "url": "https://example.com"}`
   - **Incorrect format:** `"author": "John Doe"`

4. **Component path fields (optional):**

   List the components your plugin provides:

   - `commands` (string or array): Command markdown file paths (e.g., `["./commands/init.md"]`)
   - `agents` (string or array): Agent markdown file paths (e.g., `["./agents/helper.md"]`)
   - `skills` (string or array): Skill markdown file paths (e.g., `["./skills/expert.md"]`)
   - `hooks` (string or object): Hook configuration file path or inline config
   - `mcpServers` (string or object): MCP server configuration file path or inline config

   All paths must:

   - Be relative to plugin root
   - Begin with `./`

5. **JSON validity:**
   - Properly formatted JSON
   - No syntax errors

### Component File Validation

Check that all components listed in plugin.json exist and are valid:

1. **Commands** (check files listed in `commands` array):

   - Each listed file path exists
   - Each file should contain frontmatter with description
   - Has meaningful content (not empty)
   - Uses proper markdown formatting
   - File names should be in kebab-case

2. **Agents** (check files listed in `agents` array):

   - Each listed file path exists
   - Contains clear instructions
   - Defines specialized purpose
   - Has meaningful content
   - File names should be in kebab-case

3. **Hooks** (check path in `hooks` field):

   - File path exists if specified
   - Valid JSON format
   - Contains required hook configuration
   - Hook type is valid
   - File name should be in kebab-case

4. **Skills** (check files listed in `skills` array):

   - Each listed file path exists
   - Defines domain expertise
   - Contains clear usage instructions
   - Has meaningful content
   - File names should be in kebab-case

5. **MCP Servers** (check path in `mcpServers` field):
   - File path exists if specified
   - Valid JSON format
   - Contains connection configuration
   - File name should be in kebab-case

**Additional checks:**

- Verify all component file paths are relative and begin with `./`
- Check that listed components actually exist at their specified paths
- Warn about component files that exist but aren't listed in plugin.json

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
  - File commands/broken-cmd.md found but contains no content
    Fix: Add meaningful content to the command file or remove it

⚠ Warnings:
  - No version specified in plugin.json (recommended for tracking)
  - Command "init" frontmatter description is minimal (could be more detailed)
  - No keywords specified (helps with discoverability)
  - No author information provided (recommended for attribution)
  - CODEOWNERS doesn't include @claude-market (required for marketplace submissions)

Recommendations:
  1. Add version field to plugin.json (suggest starting at "1.0.0")
  2. Expand command descriptions to be more informative
  3. Add relevant keywords for marketplace discoverability
  4. Consider adding usage examples to README
```

Be thorough but constructive in validation feedback.

## Example Output (with `--minimal` flag)

If `--minimal` flag is present in input, the following output structure MUST BE FOLLOWED:

### On Success

```
0
```

### On Failure

```
1
✗ Failed Checks:
  - File commands/broken-cmd.md found but contains no content
    Fix: Add meaningful content to the command file or remove it
```
