---
name: cc-skill-builder
description: This skill should be used when users want to create a new Claude Code skill. Use this skill to help users design, structure, and implement highly effective Claude Code skills that follow best practices for prompt engineering, tool permissions, and progressive disclosure.
allowed-tools: Read,Write,Glob,Grep,AskUserQuestion,Bash
model: inherit
version: 1.0.0
license: MIT
---

# Claude Code Skill Builder

Create highly effective Claude Code skills following industry best practices for structure, prompt engineering, and resource organization.

## Overview

Skills are specialized prompt templates that inject domain-specific instructions into Claude's conversation context. Unlike traditional tools that execute actions, skills operate through context injection to expand Claude's capabilities with specialized knowledge and workflows.

This skill helps you create skills that:

- Follow proper markdown structure with YAML frontmatter
- Use effective prompt engineering techniques
- Implement progressive disclosure patterns
- Apply appropriate tool permissions
- Organize supporting resources efficiently

## Skill Anatomy

Every skill requires a `SKILL.md` markdown file with two sections:

### 1. YAML Frontmatter (Configuration)

```yaml
---
name: skill-identifier
description: Action-oriented description of when to invoke this skill
allowed-tools: Read,Write,Bash
model: inherit
version: 1.0.0
license: MIT
---
```

**Required fields:**

- `name`: Kebab-case identifier (e.g., `python-debugger`)
- `description`: Primary signal for skill selection - use clear, action-oriented language stating when to invoke (e.g., "This skill should be used when users want to...")

**Optional fields:**

- `allowed-tools`: Comma-separated tool permissions - only include what's needed
- `model`: Model override or "inherit" for session model
- `license`, `version`: Standard metadata

### 2. Markdown Content (Instructions)

Structure your prompt following this recommended pattern:

1. **Brief purpose statement** (1-2 sentences)
2. **Overview section** - What the skill does and when to use it
3. **Prerequisites** - Required context or setup
4. **Step-by-step instructions** - Clear, imperative workflow
5. **Output format specifications** - Expected deliverables
6. **Error handling guidance** - Common issues and solutions
7. **Concrete examples** - Demonstrating usage patterns
8. **Resource references** - Links to documentation or helper files

## Best Practices

### Prompt Engineering

**Length:** Keep under 5,000 words to avoid context bloat. Move detailed content to reference files.

**Voice:** Use imperative language ("Analyze code for...", "Generate a report...") rather than second person ("You should...").

**File Paths:** Always use `{baseDir}` for file paths - never hardcode absolute paths. Example:

```
python {baseDir}/scripts/analyzer.py
```

**Progressive Disclosure:** Reveal information in stages:

1. Frontmatter discloses minimal metadata
2. Upon selection, load complete SKILL.md
3. Load helper assets as execution proceeds

### Tool Permissions

Only include tools your skill actually needs. Examples:

- Just reading/writing files: `Read,Write`
- Git operations: `Bash(git:*)`
- NPM operations: `Bash(npm:*)`
- Web research: `Read,Write,WebFetch,WebSearch`

Avoid listing unnecessary tools - each permission increases security risk.

### Resource Organization

Bundle supporting files in three directories:

**`scripts/`** - Executable Python/Bash automation

- Use for complex operations requiring precise logic
- Reference as: `python {baseDir}/scripts/script_name.py`

**`references/`** - Documentation loaded into Claude's context

- Detailed markdown files, JSON schemas, configuration templates
- Read via Read tool when needed

**`assets/`** - Templates and binary files referenced by path

- HTML templates, CSS, images, configuration boilerplate
- Not loaded into context, only referenced by path

## Common Skill Patterns

### 1. Script Automation

Offload complex operations to Python/Bash scripts. Example:

```markdown
Execute the analysis script:
\`\`\`bash
python {baseDir}/scripts/analyze.py --input {file}
\`\`\`
```

### 2. Read-Process-Write

File transformation workflows:

1. Read input file(s)
2. Process/transform content
3. Write output file(s)

### 3. Search-Analyze-Report

Codebase analysis:

1. Search for patterns using Grep/Glob
2. Analyze findings
3. Generate structured report

### 4. Command Chain Execution

Multi-step operations with dependencies:

```markdown
1. Run tests: `npm test`
2. Build project: `npm run build`
3. Deploy: `npm run deploy`
```

### 5. Wizard-Style Workflows

Multi-step with user confirmation between phases:

1. Gather requirements via AskUserQuestion
2. Show plan, get approval
3. Execute approved plan step-by-step

## Skill Creation Workflow

When a user asks to create a skill, follow these steps:

### Step 1: Gather Requirements

Use AskUserQuestion to collect:

1. Skill name (kebab-case)
2. Domain/technology focus
3. Specialized knowledge to provide
4. Tools needed
5. Specific tasks to handle

### Step 2: Design Frontmatter

Create YAML configuration with:

- Clear, action-oriented description
- Minimal necessary tool permissions
- Appropriate model setting (usually "inherit")

Example description pattern:

> "This skill should be used when users want to [specific action/goal]. Use this skill to [key capabilities]."

### Step 3: Structure Prompt Content

Organize instructions following the recommended pattern:

1. Purpose statement
2. Overview
3. Prerequisites (if any)
4. Step-by-step workflow
5. Output specifications
6. Error handling
7. Examples
8. References

### Step 4: Optimize for Context

- Keep prompt under 5,000 words
- Use imperative voice throughout
- Replace absolute paths with `{baseDir}`
- Move lengthy content to reference files

### Step 5: Identify Supporting Resources

Determine if the skill needs:

- **Scripts** for complex automation
- **References** for detailed documentation
- **Assets** for templates or configurations

Create these in appropriate directories if needed.

### Step 6: Write and Validate

1. Create `SKILL.md` file with complete content
2. Review against best practices checklist
3. Test skill invocation and context injection
4. Refine based on effectiveness

## Skill Selection Mechanics

Skills are selected through Claude's native language understanding, not algorithmic matching. The `description` field is the primary signal.

**Effective descriptions:**

- State explicit usage conditions
- Use action-oriented language
- Specify concrete scenarios
- Avoid vague or overly broad language

**Examples:**

Good: "This skill should be used when users want to analyze Python code for performance bottlenecks and suggest optimizations."

Poor: "Python code analysis helper"

## Common Pitfalls to Avoid

1. **Over-permission:** Listing tools not actually needed
2. **Context bloat:** Prompts exceeding 5,000 words
3. **Second-person voice:** Using "you should" instead of imperatives
4. **Hardcoded paths:** Absolute paths instead of `{baseDir}`
5. **Vague descriptions:** Unclear skill selection criteria
6. **Missing examples:** No concrete usage demonstrations
7. **Monolithic design:** Not using progressive disclosure or reference files

## Output Format

When creating a skill, deliver:

1. **Complete SKILL.md file** with frontmatter and instructions
2. **Tool permission justification** explaining why each tool is needed
3. **Usage example** demonstrating skill invocation
4. **Supporting resources** (scripts, references, assets) if applicable
5. **Integration instructions** for adding to plugin

## Error Handling

If skill requirements are unclear:

1. Ask clarifying questions before proceeding
2. Suggest similar existing skills as references
3. Recommend breaking complex skills into multiple focused skills

If tool permissions seem excessive:

1. Review each tool against actual usage
2. Suggest script-based alternatives for complex operations
3. Consider progressive tool loading patterns

## Resources

- Claude Code Skills Guide: https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/
- Claude Code Skills Docs: https://www.anthropic.com/news/skills
- Claude Code Working with Skills: https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills

## Examples

### Example 1: Simple Read-Process-Write Skill

```yaml
---
name: json-formatter
description: This skill should be used when users want to format and validate JSON files with proper indentation and error checking.
allowed-tools: Read,Write
model: inherit
---

# JSON Formatter

Format and validate JSON files with proper indentation.

## Steps

1. Read the specified JSON file using Read tool
2. Parse and validate JSON structure
3. Format with consistent indentation (2 spaces)
4. Write formatted content back to file
5. Report any syntax errors or validation issues

## Output Format

Provide summary including:
- File path processed
- Validation status
- Formatting changes applied
- Any errors encountered
```

### Example 2: Script-Based Analysis Skill

```yaml
---
name: dependency-analyzer
description: This skill should be used when users want to analyze project dependencies for security vulnerabilities, outdated packages, and license compliance issues.
allowed-tools: Read,Bash(npm:*,pip:*)
model: inherit
---

# Dependency Analyzer

Analyze project dependencies for security, currency, and licensing.

## Overview

Examines package.json (Node) or requirements.txt (Python) dependencies and generates comprehensive analysis reports.

## Steps

1. Identify project type (Node.js or Python)
2. Read dependency manifest file
3. Run security audit: `npm audit` or `pip-audit`
4. Check for outdated packages
5. Analyze license compatibility
6. Generate structured report

## Output Format

Markdown report with sections:
- Critical vulnerabilities
- Outdated dependencies with update recommendations
- License compliance issues
- Summary statistics
```

## Key Principles

1. **Skills inject context, not code** - Focus on instructions, not implementation
2. **Description drives selection** - Make it clear and action-oriented
3. **Minimal permissions** - Only request tools actually needed
4. **Progressive disclosure** - Reveal complexity gradually
5. **Imperative voice** - Direct instructions, not suggestions
6. **Path variables** - Always use `{baseDir}` for portability
7. **Concrete examples** - Show, don't just tell
8. **Stay focused** - One skill, one purpose

When in doubt, create a simpler, more focused skill rather than a complex multi-purpose one.
