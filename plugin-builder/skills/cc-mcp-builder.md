---
name: cc-mcp-builder
description: This skill should be used when users want to configure a new MCP (Model Context Protocol) server in Claude Code. Use this skill to help users configure MCP servers that connect Claude to external tools, APIs, and data sources.
allowed-tools: Read,Write,Glob,Grep,AskUserQuestion,Bash
model: inherit
version: 1.0.0
license: MIT
---

# Claude Code MCP Server Configuration Builder

Configure MCP (Model Context Protocol) servers to connect Claude Code to external tools, APIs, databases, and data sources following best practices.

## Overview

The Model Context Protocol (MCP) is an open standard that enables Claude Code to connect to external tools and data sources. Think of it as "USB-C for AI" - a universal way to connect AI models to different services.

MCP servers provide:

- **Tools**: Actions Claude can execute (e.g., search GitHub, query databases)
- **Resources**: Data Claude can access (e.g., file contents, API responses)
- **Prompts**: Reusable prompt templates exposed as commands

This skill helps you configure MCP servers that:

- Follow proper JSON configuration structure
- Use appropriate transport types (HTTP, stdio, SSE)
- Handle authentication securely via environment variables
- Work across team members with flexible configuration
- Integrate seamlessly with Claude Code workflows

## MCP Server Configuration Anatomy

MCP servers are configured in `.mcp.json` files with a standardized JSON format:

### Basic Structure

```json
{
  "mcpServers": {
    "server-name": {
      "type": "http",
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${API_TOKEN}"
      }
    }
  }
}
```

### Configuration Fields

**Server identifier:**

- `"server-name"`: Kebab-case unique identifier for this server

**Required for all servers:**

- `type`: Transport type - `"http"`, `"stdio"`, or `"sse"`

**Transport-specific fields:**

**HTTP servers:**

- `url`: HTTPS endpoint URL
- `headers`: (optional) Custom headers for authentication

**Stdio servers:**

- `command`: Path to executable
- `args`: (optional) Array of command arguments
- `env`: (optional) Environment variables object

**SSE servers (deprecated):**

- `url`: Server-Sent Events endpoint
- Note: Use HTTP instead when possible

## Transport Types

### HTTP Servers (Recommended for Remote Services)

Best for cloud services and remote APIs.

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.github.com/mcp",
      "headers": {
        "Authorization": "Bearer ${GITHUB_TOKEN}",
        "Accept": "application/json"
      }
    }
  }
}
```

**Advantages:**

- Wide compatibility
- No local installation required
- Easy to scale
- Standard authentication patterns

**Use when:**

- Connecting to SaaS APIs
- Remote data sources
- Cloud-hosted services
- Third-party integrations

### Stdio Servers (Best for Local Tools)

Runs local processes on your machine.

```json
{
  "mcpServers": {
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${DATABASE_URL}"
      }
    }
  }
}
```

**Advantages:**

- Direct system access
- Full control over execution
- No network dependency
- Fast local operations

**Use when:**

- Local database access
- File system operations
- Command-line tools
- Development utilities

### SSE Servers (Deprecated)

Server-Sent Events transport - avoid for new configurations.

```json
{
  "mcpServers": {
    "legacy-service": {
      "type": "sse",
      "url": "https://example.com/events"
    }
  }
}
```

**Migration recommendation**: Convert to HTTP transport when possible.

## Environment Variables

Use environment variables for sensitive data and machine-specific paths.

### Expansion Syntax

**Simple expansion:**

```json
{
  "url": "https://${API_HOST}/mcp"
}
```

**With defaults:**

```json
{
  "command": "${PYTHON_PATH:-/usr/bin/python3}"
}
```

### Best Practices

**Security:**

- Never hardcode API keys or tokens
- Use environment variables for credentials
- Store secrets in `.env` files (gitignored)
- Use system environment or `.env` loaders

**Portability:**

- Provide sensible defaults with `${VAR:-default}`
- Document required environment variables
- Test across different environments
- Use relative paths when possible

### Example: Secure Configuration

```json
{
  "mcpServers": {
    "stripe": {
      "type": "http",
      "url": "${STRIPE_API_URL:-https://api.stripe.com/mcp}",
      "headers": {
        "Authorization": "Bearer ${STRIPE_API_KEY}"
      }
    }
  }
}
```

**Required .env:**

```bash
STRIPE_API_KEY=sk_test_...
STRIPE_API_URL=https://api.stripe.com/mcp  # Optional, has default
```

## Configuration Scope

### Project Scope (Recommended for Teams)

**Location**: `.mcp.json` in project root
**Shared via**: Git version control
**Best for**: Team collaboration, standardized tools

```json
{
  "mcpServers": {
    "team-database": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${DATABASE_URL}"
      }
    }
  }
}
```

**Advantages:**

- Everyone uses same tools
- Consistent development environment
- Easy onboarding
- Version controlled

### User Scope (Personal Tools)

**Location**: `~/.claude/settings.json` under `mcpServers` key
**Shared via**: Not version controlled
**Best for**: Personal utilities, sensitive configs

```json
{
  "mcpServers": {
    "personal-notes": {
      "type": "http",
      "url": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer ${PERSONAL_API_KEY}"
      }
    }
  }
}
```

**Advantages:**

- Private configurations
- Personal preferences
- Cross-project availability
- No team impact

### Local Scope (User + Project)

**Location**: `.claude/mcp.json` (project-specific user overrides)
**Shared via**: Gitignored
**Best for**: Machine-specific overrides

## Common MCP Server Patterns

### 1. REST API Integration (HTTP)

```json
{
  "mcpServers": {
    "openweather": {
      "type": "http",
      "url": "https://api.openweathermap.org/mcp/v1",
      "headers": {
        "X-API-Key": "${OPENWEATHER_API_KEY}",
        "Content-Type": "application/json"
      }
    }
  }
}
```

**Tools provided**: Weather queries, forecasts
**Resources**: Location data, current conditions

### 2. Database Access (Stdio)

```json
{
  "mcpServers": {
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${DATABASE_URL}"
      }
    }
  }
}
```

**Tools provided**: SQL queries, schema inspection
**Resources**: Database tables, query results

### 3. File System Operations (Stdio)

```json
{
  "mcpServers": {
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "${PROJECT_ROOT:-.}"
      ],
      "env": {
        "PROJECT_ROOT": "${PWD}"
      }
    }
  }
}
```

**Tools provided**: Read/write files, directory operations
**Resources**: File contents, directory listings

### 4. GitHub Integration (HTTP)

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.github.com/mcp",
      "headers": {
        "Authorization": "Bearer ${GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
      }
    }
  }
}
```

**Tools provided**: Create issues, manage PRs, search repos
**Resources**: Repository data, issue lists

### 5. Web Search (HTTP)

```json
{
  "mcpServers": {
    "brave-search": {
      "type": "http",
      "url": "https://api.search.brave.com/mcp/v1",
      "headers": {
        "X-Subscription-Token": "${BRAVE_API_KEY}"
      }
    }
  }
}
```

**Tools provided**: Web search, news search
**Resources**: Search results, snippets

### 6. Browser Automation (Stdio)

```json
{
  "mcpServers": {
    "puppeteer": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

**Tools provided**: Navigate URLs, screenshot, execute JavaScript
**Resources**: Page contents, DOM elements

### 7. Slack Integration (HTTP)

```json
{
  "mcpServers": {
    "slack": {
      "type": "http",
      "url": "https://slack.com/api/mcp",
      "headers": {
        "Authorization": "Bearer ${SLACK_BOT_TOKEN}",
        "Content-Type": "application/json"
      }
    }
  }
}
```

**Tools provided**: Send messages, create channels, manage users
**Resources**: Channel lists, message history

## Platform-Specific Considerations

### Windows Compatibility

Wrap `npx` commands with `cmd /c` for native Windows execution:

```json
{
  "mcpServers": {
    "postgres": {
      "type": "stdio",
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${DATABASE_URL}"
      }
    }
  }
}
```

### macOS/Linux

Use standard shell execution:

```json
{
  "mcpServers": {
    "custom-tool": {
      "type": "stdio",
      "command": "/usr/local/bin/custom-tool",
      "args": ["--mcp-mode"]
    }
  }
}
```

## Installation Commands

Use Claude Code CLI for adding servers:

### HTTP Server

```bash
claude mcp add --transport http github https://api.github.com/mcp
```

### Stdio Server

```bash
claude mcp add --transport stdio postgres -- npx -y @modelcontextprotocol/server-postgres
```

Note: Use `--` to separate Claude's flags from server command args.

### From JSON

```bash
claude mcp add-json postgres '{"type":"stdio","command":"npx","args":["-y","@modelcontextprotocol/server-postgres"]}'
```

### List Servers

```bash
claude mcp list
```

### Remove Server

```bash
claude mcp remove server-name
```

## Best Practices

### Security

**Credentials management:**

- Store API keys in environment variables
- Use `.env` files (ensure `.gitignore` includes `.env`)
- Never commit secrets to version control
- Rotate credentials regularly

**Access control:**

- Grant minimal necessary permissions
- Use read-only tokens when possible
- Audit MCP server access logs
- Review third-party server code

### Performance

**Output management:**

- Configure `MAX_MCP_OUTPUT_TOKENS` for large responses (default: 25,000)
- Use pagination for large datasets
- Cache frequently accessed resources
- Optimize query patterns

**Connection pooling:**

- Reuse connections when possible
- Close idle connections
- Monitor resource usage
- Set appropriate timeouts

### Testing

**Validation steps:**

1. Verify server appears in `claude mcp list`
2. Test basic operations in Claude Code
3. Check error handling with invalid inputs
4. Validate environment variable expansion
5. Confirm cross-platform compatibility (if applicable)

**Debugging:**

- Check server logs for errors
- Validate JSON syntax
- Test environment variables are set
- Verify network connectivity (HTTP servers)
- Confirm executables exist (stdio servers)

### Documentation

**Document for your team:**

- Required environment variables
- Setup instructions
- Available tools and resources
- Example usage patterns
- Troubleshooting guide

**Example README section:**

````markdown
## MCP Server: PostgreSQL

Provides database access via MCP.

### Setup

1. Install dependencies:
   ```bash
   npm install -g @modelcontextprotocol/server-postgres
   ```
````

2. Set environment variable:

   ```bash
   export DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
   ```

3. Configuration is in `.mcp.json` (already committed)

### Available Tools

- `query_database`: Execute SQL queries
- `list_tables`: Get all table names
- `describe_table`: Get table schema

### Example Usage

```
Ask Claude: "Query the users table for all active users"
```

## MCP Server Configuration Workflow

When a user asks to configure an MCP server, follow these steps:

### Step 1: Gather Requirements

Use AskUserQuestion to collect:

1. **Server purpose** (what tools/data does it provide?)
2. **Service type** (cloud API, local tool, database?)
3. **Transport preference** (HTTP for remote, stdio for local)
4. **Authentication** (API keys, tokens, credentials?)
5. **Scope** (project-wide or personal?)

### Step 2: Select Transport Type

Match service to transport:

- **Remote APIs**: HTTP
- **Local executables**: Stdio
- **Legacy systems**: SSE (migrate to HTTP if possible)

### Step 3: Design Configuration

Create JSON with:

1. **Unique server name** (kebab-case)
2. **Correct transport type**
3. **Required transport fields** (url/command/args)
4. **Authentication headers or env vars**
5. **Environment variable expansion** for sensitive data

### Step 4: Handle Environment Variables

Identify sensitive data:

1. API keys → `${SERVICE_API_KEY}`
2. Tokens → `${SERVICE_TOKEN}`
3. Connection strings → `${SERVICE_URL}`
4. Paths → `${TOOL_PATH:-/default/path}`

Create `.env` template with required variables.

### Step 5: Choose Scope

Determine configuration location:

- **Team-shared**: `.mcp.json` in project root (commit to git)
- **Personal**: `~/.claude/settings.json` (not committed)
- **Machine-specific**: `.claude/mcp.json` (gitignored)

### Step 6: Write Configuration

Create or update the appropriate JSON file with the server configuration.

### Step 7: Provide Setup Instructions

Include:

1. Installation commands (if applicable)
2. Environment variable setup
3. How to verify it works
4. Example usage with Claude
5. Troubleshooting tips

## Output Format

When configuring an MCP server, deliver:

1. **Complete JSON configuration** with server definition
2. **File path** where config should be saved
3. **.env template** with required environment variables
4. **Installation commands** for any dependencies
5. **Testing instructions** for validating server works
6. **Usage examples** showing how to use the server in Claude
7. **Documentation** for team members (if project-scoped)

## Error Handling

If server requirements are unclear:

1. Ask clarifying questions about the service
2. Suggest similar existing MCP servers as references
3. Explain trade-offs between HTTP vs stdio
4. Recommend security best practices

If authentication is complex:

1. Guide user through obtaining credentials
2. Explain environment variable setup
3. Provide .env template
4. Suggest secure storage methods

## Resources

- Claude Code MCP Documentation: https://docs.claude.com/en/docs/claude-code/mcp
- Model Context Protocol Spec: https://modelcontextprotocol.io/
- MCP Server Registry: https://github.com/modelcontextprotocol/servers
- Claude MCP Community: https://www.claudemcp.com/

## Key Principles

1. **Security first** - Never hardcode credentials
2. **Environment variables** - Use for all sensitive data and paths
3. **Appropriate transport** - HTTP for remote, stdio for local
4. **Project scope** - Share team tools via `.mcp.json`
5. **Documentation** - Explain setup and usage clearly
6. **Test thoroughly** - Validate across environments
7. **Minimal permissions** - Grant least privilege necessary
8. **Monitor output** - Configure token limits appropriately

When in doubt, choose HTTP transport for remote services and stdio for local tools, and always use environment variables for sensitive configuration.
