---
name: cc-agent-builder
description: This skill should be used when users want to create a new Claude Code subagent. Use this skill to help users design, structure, and implement highly effective subagents that follow best practices for specialized task handling, context isolation, and tool permissions.
allowed-tools: Read,Write,Glob,Grep,AskUserQuestion,Bash
model: inherit
version: 1.0.0
license: MIT
---

# Claude Code Subagent Builder

Create highly effective subagents following industry best practices for specialized task handling, context isolation, and system prompt design.

## Overview

Subagents are specialized AI assistants invoked to handle specific types of tasks. Each operates in its own isolated context window with customized system prompts and tool permissions. Claude intelligently routes tasks to appropriate subagents based on their descriptions.

This skill helps you create subagents that:

- Follow proper markdown structure with YAML frontmatter
- Use effective system prompt engineering
- Implement appropriate context isolation
- Apply minimal necessary tool permissions
- Handle specialized workflows efficiently

## Subagent Anatomy

Every subagent is a Markdown file with YAML frontmatter followed by a system prompt:

### File Structure

```yaml
---
name: your-sub-agent-name
description: Clear description of when this subagent should be invoked
tools: Read,Write,Bash(npm:*)
model: sonnet
---
# System Prompt

Your specialized instructions for this subagent go here.

Define the subagent's role, capabilities, workflow, and success criteria.
```

### YAML Frontmatter (Configuration)

**Required fields:**

- `name`: Unique identifier using lowercase letters and hyphens (kebab-case)
- `description`: Natural language explanation of the subagent's purpose and when to invoke it

**Optional fields:**

- `tools`: Comma-separated list of specific tools (omit to inherit all tools from main conversation)
- `model`: Model to use - accepts `sonnet`, `opus`, `haiku`, or `inherit` (default: inherit)

### File Locations

**Project subagents**: `.claude/agents/` (shared via git)

- Team-accessible specialized agents
- Project-specific workflows
- Higher priority when names conflict

**User subagents**: `~/.claude/agents/` (user-level)

- Personal utilities across all projects
- Individual workflow preferences
- Available globally

## Context Isolation

Each subagent operates in a **separate context window**, which provides:

**Benefits:**

- Main conversation stays focused on high-level objectives
- Subagent context doesn't pollute main thread
- Specialized knowledge without bloating main prompt
- Multiple subagents can work on different tasks independently

**Implications:**

- Subagent cannot directly access main conversation history
- Must provide sufficient context in the task delegation
- Results returned to main conversation as single message
- Subagent is stateless - each invocation is independent

## Tool Permissions

### Inherit All Tools (Recommended Default)

Omit the `tools` field to inherit all available tools:

```yaml
---
name: code-reviewer
description: Review code for best practices and potential issues
---
```

**When to use:**

- General-purpose subagents
- Workflows requiring flexibility
- When specific tool needs are unclear

### Specify Explicit Tools (Minimal Permissions)

List only required tools for security and clarity:

```yaml
---
name: git-committer
description: Create semantic git commits
tools: Bash(git:*)
---
```

**When to use:**

- Security-sensitive operations
- Constrained, well-defined workflows
- Preventing accidental file modifications

**Available tools**: Read, Write, Edit, Bash, Grep, Glob, WebFetch, WebSearch, and MCP tools (when tools field is omitted)

## Model Selection

Choose the appropriate model for your subagent's complexity:

- **inherit** (default): Use same model as main conversation
- **haiku**: Fast, cost-effective for straightforward tasks (formatting, simple analysis)
- **sonnet**: Balanced for most workflows (code review, testing, documentation)
- **opus**: Complex reasoning, critical decisions, architectural design

**Best practice**: Start with `inherit` and only specify a model if you need different capabilities than the main thread.

## Best Practices

### System Prompt Engineering

**Define clear role and responsibility:**

```markdown
You are a specialized code reviewer focused on security vulnerabilities in web applications. Your expertise includes OWASP Top 10, secure authentication patterns, and data validation.
```

**Specify workflow steps:**

```markdown
## Workflow

1. Read the provided code files
2. Identify security vulnerabilities
3. Classify by severity (Critical, High, Medium, Low)
4. Suggest specific fixes with code examples
5. Explain security implications
```

**Set success criteria:**

```markdown
## Success Criteria

Your review is complete when you have:

- Identified all OWASP Top 10 vulnerabilities
- Provided actionable fixes for each issue
- Explained the security impact
- Suggested preventive measures
```

**Include examples:**

```markdown
## Example Output

### Critical: SQL Injection Vulnerability

**Location**: src/api/users.js:45

**Issue**: User input directly concatenated into SQL query

**Fix**:
\`\`\`javascript
// Before: Vulnerable
const query = `SELECT * FROM users WHERE id = ${userId}`;

// After: Secure
const query = 'SELECT \* FROM users WHERE id = ?';
db.query(query, [userId]);
\`\`\`

**Impact**: Attackers can execute arbitrary SQL, accessing/modifying sensitive data.
```

### Progressive Disclosure

Structure information from high-level to detailed:

1. **Role definition** - Who is this subagent?
2. **Capabilities** - What can it do?
3. **Workflow** - How does it work?
4. **Output format** - What does it deliver?
5. **Edge cases** - How to handle exceptions
6. **Examples** - Concrete demonstrations

### Single Responsibility

Each subagent should have one clear purpose:

**Good**: `test-generator` - Generates unit tests for JavaScript functions
**Poor**: `dev-helper` - Does various development tasks

**Why**: Clear responsibility enables better task routing and more focused context.

### Constraints and Boundaries

Define what the subagent should NOT do:

```markdown
## Constraints

- DO NOT modify production configuration files
- DO NOT commit changes automatically
- DO NOT delete existing tests
- ALWAYS preserve existing functionality
- ALWAYS ask for confirmation before destructive operations
```

## Common Subagent Patterns

### 1. Code Analysis Subagent

```yaml
---
name: code-analyzer
description: Analyze code quality, complexity, and maintainability metrics
tools: Read,Grep
model: sonnet
---

You are a code quality analyst specializing in static analysis and complexity metrics.

## Workflow

1. Read the specified files or directory
2. Calculate cyclomatic complexity for each function
3. Identify code smells (long functions, deep nesting, etc.)
4. Measure test coverage if tests exist
5. Generate actionable recommendations

## Output Format

Provide a structured report with:
- Overall quality score (0-100)
- Complexity metrics per file/function
- Identified code smells with locations
- Prioritized recommendations
- Example refactorings for top 3 issues
```

### 2. Documentation Generator Subagent

```yaml
---
name: doc-generator
description: Generate comprehensive documentation from source code
tools: Read,Write
model: sonnet
---

You are a technical documentation specialist creating clear, accurate API documentation.

## Workflow

1. Read source code files
2. Extract function signatures, parameters, return types
3. Parse JSDoc/docstring comments
4. Generate markdown documentation
5. Include usage examples
6. Create table of contents

## Documentation Standards

- Use clear, concise language
- Include all parameters with types
- Provide practical examples
- Document edge cases and errors
- Link related functions

## Output Location

Write documentation to:
- Single file: `docs/api/[filename].md`
- Multiple files: `docs/api/[module-name]/`
```

### 3. Test Generator Subagent

```yaml
---
name: test-generator
description: Generate comprehensive unit tests for JavaScript/TypeScript functions
tools: Read,Write
model: sonnet
---

You are a testing specialist focused on creating thorough, maintainable unit tests.

## Test Generation Principles

- Test happy path and edge cases
- Include boundary value testing
- Mock external dependencies
- Follow AAA pattern (Arrange, Act, Assert)
- Use descriptive test names

## Workflow

1. Read the source file
2. Identify all exported functions
3. For each function:
   - Analyze parameters and return types
   - Identify edge cases
   - Generate test cases
4. Write tests using project's testing framework
5. Ensure tests are independent and isolated

## Coverage Goals

- 100% function coverage
- 80%+ branch coverage
- All error paths tested
```

### 4. Git Workflow Subagent

```yaml
---
name: git-pr-reviewer
description: Review pull requests for code quality and team standards
tools: Bash(git:*),Read
model: sonnet
---

You are a senior engineer conducting thorough pull request reviews.

## Review Checklist

1. **Code Quality**
   - Follows team style guide
   - No code smells
   - Appropriate abstractions

2. **Testing**
   - New code has tests
   - Tests are meaningful
   - Edge cases covered

3. **Documentation**
   - Public APIs documented
   - Complex logic explained
   - README updated if needed

4. **Security**
   - No sensitive data exposed
   - Input validation present
   - Authentication/authorization correct

5. **Performance**
   - No obvious bottlenecks
   - Database queries optimized
   - Appropriate data structures

## Workflow

1. Fetch PR diff: git diff main...feature-branch
2. Review each changed file
3. Check test coverage
4. Verify documentation
5. Provide constructive feedback with examples

## Output Format

**Summary**: Brief overview of changes
**Strengths**: What was done well
**Issues**: Problems requiring fixes (with severity)
**Suggestions**: Optional improvements
**Verdict**: Approve / Request Changes / Comment
```

### 5. Refactoring Subagent

```yaml
---
name: refactoring-assistant
description: Apply code refactoring patterns while preserving behavior
tools: Read,Write,Edit
model: sonnet
---

You are a refactoring specialist applying proven patterns to improve code quality.

## Refactoring Catalog

- Extract Function
- Extract Variable
- Inline Function
- Rename Symbol
- Move Function
- Simplify Conditional
- Replace Magic Numbers
- Remove Dead Code

## Safety Rules

1. **Preserve Behavior**: Refactored code must behave identically
2. **Incremental Changes**: One refactoring at a time
3. **Test Coverage**: Verify tests pass after changes
4. **Reversible**: Document what changed for easy rollback

## Workflow

1. Read the target code
2. Identify code smells requiring refactoring
3. Select appropriate refactoring pattern
4. Apply transformation carefully
5. Show before/after diff
6. Explain why refactoring improves code
7. Recommend running tests

## Output Format

**Refactoring Applied**: [Pattern Name]
**Location**: [File:Line]
**Before**: [Code snippet]
**After**: [Refactored code]
**Benefits**: [Why this improves code]
**Testing**: [Recommend specific tests to run]
```

## Subagent Creation Workflow

When a user asks to create a subagent, follow these steps:

### Step 1: Gather Requirements

Use AskUserQuestion to collect:

1. **Subagent name** (kebab-case, descriptive)
2. **Primary purpose** (what specialized task does it handle?)
3. **When to invoke** (what triggers/conditions?)
4. **Tools needed** (minimal set or inherit all?)
5. **Model preference** (inherit, haiku, sonnet, opus?)
6. **Scope** (project-specific or personal?)

### Step 2: Design System Prompt

Structure the prompt with:

1. **Role definition** - Who is this subagent?
2. **Capabilities** - What can it do?
3. **Workflow** - Step-by-step process
4. **Output format** - Expected deliverables
5. **Constraints** - What NOT to do
6. **Examples** - Concrete demonstrations

### Step 3: Configure Tools

Determine tool strategy:

- **Omit tools field**: For flexible, general-purpose subagents
- **Minimal explicit list**: For security-sensitive or constrained workflows
- **MCP compatibility**: Tools field omission enables MCP tool access

### Step 4: Select Model

Choose based on task complexity:

- **inherit**: Default, matches main conversation
- **haiku**: Simple formatting, quick analysis
- **sonnet**: Most workflows, balanced capability
- **opus**: Complex reasoning, critical decisions

### Step 5: Write and Validate

1. Create complete .md file with frontmatter and system prompt
2. Ensure description clearly explains when to invoke
3. Verify workflow steps are actionable
4. Include concrete examples
5. Define success criteria
6. Test that subagent can be invoked correctly

## Output Format

When creating a subagent, deliver:

1. **Complete .md file** with frontmatter and system prompt
2. **File path** where it should be saved
3. **Tool selection justification** explaining the tools strategy
4. **Invocation examples** demonstrating when Claude will route to this subagent
5. **Testing instructions** for validating the subagent works

## Error Handling

If subagent requirements are unclear:

1. Ask clarifying questions about the specialized task
2. Suggest similar existing subagents as references
3. Recommend breaking overly complex subagents into multiple focused ones
4. Explain trade-offs between tool inheritance vs explicit permissions

If the subagent seems too broad:

1. Identify the core responsibility
2. Suggest splitting into multiple focused subagents
3. Explain benefits of single-responsibility design

## Resources

- Claude Code Subagents Docs: https://docs.claude.com/en/docs/claude-code/sub-agents
- Context Engineering Guide: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Community Subagents: https://github.com/VoltAgent/awesome-claude-code-subagents

## Key Principles

1. **Single responsibility** - One clear purpose per subagent
2. **Context isolation** - Each subagent has separate context window
3. **Clear descriptions** - Enable intelligent task routing
4. **Minimal tools** - Only request what's needed (or inherit all)
5. **Appropriate model** - Match complexity to task requirements
6. **Concrete examples** - Show don't just tell
7. **Success criteria** - Define what "done" looks like
8. **Safety constraints** - Specify what NOT to do

When in doubt, create a simpler, more focused subagent rather than a complex multi-purpose one.
