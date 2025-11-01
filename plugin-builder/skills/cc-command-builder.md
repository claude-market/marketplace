---
name: cc-command-builder
description: This skill should be used when users want to create a new Claude Code slash command. Use this skill to help users design, structure, and implement highly effective slash commands that follow best practices for prompt engineering and argument handling.
allowed-tools: Read,Write,Glob,Grep,AskUserQuestion,Bash
model: inherit
version: 1.0.0
license: MIT
---

# Claude Code Slash Command Builder

Create highly effective slash commands following industry best practices for structure, prompt engineering, and argument handling.

## Overview

Slash commands are reusable prompt templates stored as Markdown files that enable quick execution of frequently-used operations. They support dynamic arguments, bash execution, file references, and can be scoped to projects or users.

This skill helps you create slash commands that:

- Follow proper markdown structure with optional YAML frontmatter
- Use effective prompt engineering techniques
- Handle arguments correctly ($ARGUMENTS vs positional parameters)
- Apply appropriate tool permissions
- Include practical examples and edge case handling

## Slash Command Anatomy

Every slash command is a Markdown file with an optional YAML frontmatter section:

### File Structure

```yaml
---
allowed-tools: Read,Write,Bash(git:*)
argument-hint: [message]
description: Brief command description
model: claude-3-5-haiku-20241022
disable-model-invocation: false
---
# Command Prompt Content

Your natural language instructions go here.

Use $ARGUMENTS or $1, $2, etc. for dynamic values.
```

### YAML Frontmatter (Optional Configuration)

**Optional fields:**

- `description`: Brief description shown in command listings and SlashCommand tool (highly recommended)
- `allowed-tools`: Comma-separated tool permissions (e.g., `Read,Write,Bash(git:*)`)
- `argument-hint`: Display hint for expected arguments (e.g., `[issue-number] [priority]`)
- `model`: Override default model (use model ID like `claude-3-5-haiku-20241022`)
- `disable-model-invocation`: Set to `true` for commands that just provide context without needing AI response

### File Locations

**Project commands**: `.claude/commands/` (shared via git)

- Team-accessible commands
- Project-specific workflows
- Higher priority when names conflict

**Personal commands**: `~/.claude/commands/` (user-level)

- Cross-project utilities
- Personal preferences
- Available in all projects

## Argument Handling

### $ARGUMENTS - Capture Everything

Use when you want all arguments as a single string:

```markdown
---
argument-hint: [commit message]
---

Create a git commit with message: $ARGUMENTS
```

**Usage**: `/commit fix: resolve authentication bug`
**Result**: `$ARGUMENTS = "fix: resolve authentication bug"`

### Positional Parameters - $1, $2, $3, etc.

Use when you need structured, multi-part arguments:

```markdown
---
argument-hint: [pr-number] [priority] [reviewer]
---

Review PR #$1 with $2 priority. Assign reviewer: $3
```

**Usage**: `/review-pr 456 high alice`
**Result**:

- `$1 = "456"`
- `$2 = "high"`
- `$3 = "alice"`

**Best practice**: Use positional parameters when:

- Arguments have distinct semantic roles
- You need to reference parameters in different parts of the prompt
- Order matters for your workflow
- You want to provide structured validation

## Advanced Features

### Bash Execution

Execute shell commands inline using `!` prefix:

```markdown
Current git status:
!`git status --short`

Recent commits:
!`git log --oneline -10`
```

**Security note**: Ensure bash commands are safe and don't expose sensitive data.

### File References

Include file contents using `@` prefix:

```markdown
Compare these implementations:

Old version: @src/old-version.js
New version: @src/new-version.js

Analyze differences and suggest improvements.
```

### Namespacing

Organize commands in subdirectories within `.claude/commands/`:

```
.claude/commands/
├── git/
│   ├── commit.md
│   └── review.md
└── testing/
    └── run-suite.md
```

**Note**: Namespacing affects description display only, not the command name itself.

## Best Practices

### Prompt Engineering

**Clarity**: Be specific about what Claude should do. Use imperative language.

Good:

```markdown
Analyze the current git diff and generate a semantic commit message following Conventional Commits format.
```

Poor:

```markdown
Help me with git stuff.
```

**Structure**: Break complex commands into clear steps:

```markdown
1. Read the failing test file: @tests/auth.test.js
2. Analyze the error message: $ARGUMENTS
3. Identify the root cause
4. Suggest specific fixes with code examples
5. Explain why the test failed
```

**Context**: Provide sufficient background without over-specifying:

```markdown
You are reviewing a pull request for a Node.js Express API.
Focus on: security vulnerabilities, performance issues, and code maintainability.
PR number: $1
```

### Tool Permissions

Only request tools your command actually needs:

- **Read-only analysis**: `Read`
- **File modifications**: `Read,Write`
- **Git operations**: `Bash(git:*)`
- **Testing**: `Bash(npm test:*),Bash(jest:*)`
- **Web research**: `Read,WebFetch,WebSearch`

**Security**: Avoid `Bash` without restrictions. Use `Bash(command:*)` for specific commands.

### Argument Validation

Guide users with helpful hints and validation:

```markdown
---
argument-hint: [feature-name] [ticket-id]
description: Create a new feature branch following team conventions
---

Create git branch for feature: $1 (ticket: $2)

Validation:

- Feature name must be kebab-case
- Ticket ID must match pattern: PROJ-\d+

If invalid, explain the correct format and ask user to retry.
```

### Error Handling

Anticipate common issues:

```markdown
---
description: Deploy to production environment
---

Pre-deployment checklist:

!`git status`

If uncommitted changes exist, STOP and ask user to commit or stash.
If not on main branch, STOP and ask user to checkout main.
If behind remote, STOP and ask user to pull latest changes.

Otherwise, proceed with: npm run deploy:prod
```

## Command Creation Workflow

When a user asks to create a slash command, follow these steps:

### Step 1: Gather Requirements

Use AskUserQuestion to collect:

1. **Command name** (kebab-case, descriptive, no conflicts with existing commands)
2. **Command purpose** (what problem does it solve?)
3. **Expected arguments** (none, simple, or structured?)
4. **Tools needed** (read files, write files, run commands?)
5. **Scope** (project-specific or personal?)

### Step 2: Design Arguments Strategy

Determine the best approach:

- **No arguments**: Simple, self-contained commands
- **$ARGUMENTS**: Single string input (commit messages, search queries, descriptions)
- **Positional parameters**: Multiple distinct inputs (IDs, names, options)

### Step 3: Structure Frontmatter

Create YAML configuration with:

- Clear `description` for discoverability
- Minimal necessary `allowed-tools`
- Helpful `argument-hint` if arguments are used
- Model override only if specific model is required

### Step 4: Write Prompt Content

Organize instructions following best practices:

1. **Clear objective statement** - What this command does
2. **Argument handling** - How to use $ARGUMENTS or $1, $2, etc.
3. **Step-by-step workflow** - Numbered list of actions
4. **Validation** - Check inputs, prerequisites, or state
5. **Error handling** - What to do if something fails
6. **Output format** - Expected deliverables or response

### Step 5: Add Examples

Include concrete usage examples:

```markdown
## Examples

Basic usage:
/my-command feature-auth PROJ-123

With optional parameters:
/my-command feature-auth PROJ-123 high-priority
```

### Step 6: Validate and Test

Before finalizing:

1. Check markdown syntax
2. Verify YAML frontmatter is valid
3. Ensure argument references match usage pattern
4. Test bash commands are safe
5. Confirm file paths use `@` notation correctly

## Common Patterns

### 1. Git Workflow Commands

```markdown
---
description: Create semantic commit with auto-generated message
allowed-tools: Bash(git:*)
---

1. Review staged changes: !`git diff --staged`
2. Generate commit message following Conventional Commits
3. Execute: git commit -m "[generated message]"
```

### 2. Code Analysis Commands

```markdown
---
description: Analyze code for security vulnerabilities
allowed-tools: Read,Grep,WebSearch
argument-hint: [file-pattern]
---

1. Find files matching: $ARGUMENTS
2. Scan for common vulnerabilities (SQL injection, XSS, etc.)
3. Report findings with severity levels
4. Suggest fixes with code examples
```

### 3. Documentation Commands

```markdown
---
description: Generate API documentation from source code
allowed-tools: Read,Write
argument-hint: [source-file]
---

1. Read source file: @$1
2. Extract function signatures and JSDoc comments
3. Generate markdown documentation
4. Write to docs/ directory
```

### 4. Testing Commands

```markdown
---
description: Run tests and generate coverage report
allowed-tools: Bash(npm:*),Read
---

1. Execute: !`npm test -- --coverage`
2. Parse coverage report
3. Highlight files below 80% coverage
4. Suggest additional test cases
```

### 5. Refactoring Commands

```markdown
---
argument-hint: [file-path] [refactor-type]
description: Apply code refactoring patterns
allowed-tools: Read,Write
---

Refactor file: @$1
Type: $2 (extract-function|rename-variable|simplify-conditional)

1. Analyze current code structure
2. Apply refactoring pattern
3. Preserve behavior
4. Show diff of changes
```

## Output Format

When creating a slash command, deliver:

1. **Complete .md file** with frontmatter and prompt content
2. **File path** where it should be saved
3. **Tool permission justification** explaining why each tool is needed
4. **Usage examples** demonstrating different argument patterns
5. **Testing instructions** for validating the command works

## Error Handling

If command requirements are unclear:

1. Ask clarifying questions about the workflow
2. Suggest similar existing commands as references
3. Recommend breaking complex commands into multiple focused commands
4. Explain trade-offs between $ARGUMENTS vs positional parameters

If tool permissions seem excessive:

1. Review each tool against actual usage in the prompt
2. Suggest using more restrictive tool scopes (e.g., `Bash(git:*)` instead of `Bash`)
3. Consider if the command should delegate to a subagent instead

## Resources

- Claude Code Slash Commands Docs: https://docs.claude.com/en/docs/claude-code/slash-commands
- Conventional Commits: https://www.conventionalcommits.org/
- Claude Code Plugins: https://www.anthropic.com/news/claude-code-plugins

## Key Principles

1. **Commands are templates, not code** - Focus on natural language instructions
2. **Description enables discovery** - Make it clear and searchable
3. **Minimal permissions** - Only request tools actually needed
4. **Arguments follow purpose** - Use $ARGUMENTS for simple, positional for structured
5. **Validate inputs** - Guide users when arguments are invalid
6. **Handle errors gracefully** - Check prerequisites before executing
7. **Show examples** - Demonstrate usage patterns clearly
8. **Stay focused** - One command, one purpose

When in doubt, create a simpler, more focused command rather than a complex multi-purpose one.
