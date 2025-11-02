---
name: integration-expert
description: This skill should be used when working with SpecForge plugin composition, integration patterns, and ensuring backend, database, and codegen plugins work together effectively. Use this skill to coordinate between plugins, handle plugin discovery, and manage compatibility.
allowed-tools: Read,Write,Bash,Grep,Glob
model: inherit
version: 1.0.0
license: MIT
---

# SpecForge Integration Expert

Expert in plugin composition strategies, integration patterns, and coordinating between SpecForge ecosystem plugins (backend, database, codegen, frontend).

## Overview

SpecForge uses a multi-plugin architecture where specialized plugins work together to create production-ready applications. This skill provides expertise in:

- Discovering and selecting compatible plugins
- Coordinating between backend, database, and codegen plugins
- Managing plugin dependencies and compatibility
- Ensuring type safety across the plugin ecosystem
- Troubleshooting integration issues

## Core Plugin Categories

### Three-Plugin Architecture

Every SpecForge project requires **three core plugins**:

1. **Backend Plugin** (`specforge-backend-{tech}-{framework}`)

   - Framework-specific patterns and handlers
   - HTTP request/response handling
   - Business logic implementation
   - Examples: `specforge-backend-rust-axum`, `specforge-backend-node-express`

2. **Database Plugin** (`specforge-db-{database}`)

   - Database-specific tooling and configuration
   - Migration management
   - Docker setup and health checks
   - Examples: `specforge-db-postgresql`, `specforge-db-sqlite`

3. **Codegen Pipeline Plugin** (`specforge-generate-{tech}-{database}`)
   - Type-safe database access code generation
   - Bridges backend framework with database
   - Compile-time verification
   - Examples: `specforge-generate-rust-sql`, `specforge-generate-ts-prisma`

### Optional Plugins

4. **Frontend Plugin** (`specforge-frontend-{framework}-{variant}`)
   - Frontend framework patterns
   - API client generation
   - State management setup
   - Examples: `specforge-frontend-react-tanstack`, `specforge-frontend-vue-pinia`

## Plugin Discovery

### Method 1: GitHub API Discovery

Query the Claude Market marketplace for available SpecForge plugins:

```bash
# Discover all SpecForge plugins
curl -s https://api.github.com/repos/claude-market/marketplace/contents/ \
  | jq -r '.[] | select(.type == "dir" and (.name | startswith("specforge-"))) | .name'

# Filter by category
curl -s https://api.github.com/repos/claude-market/marketplace/contents/ \
  | jq -r '.[] | select(.type == "dir" and (.name | startswith("specforge-backend-"))) | .name'
```

### Method 2: Read Project Configuration

Check the project's `CLAUDE.md` for the configured stack:

```markdown
## SpecForge configuration (EDIT ONLY IF YOU ARE SPECFORGE AGENT)

- backend: rust-axum
- database: sqlite
- codegen: rust-sql
- frontend: react-tanstack
```

### Method 3: Plugin Manifest Inspection

Read plugin's `.claude-plugin/plugin.json` to understand capabilities:

```json
{
  "name": "specforge-backend-rust-axum",
  "specforge": {
    "category": "backend",
    "technology": "rust",
    "variant": "axum",
    "provides": {
      "patterns": true,
      "handlers": true,
      "testing": true,
      "docker": true
    },
    "requires": {
      "categories": ["database", "codegen"]
    },
    "compatible_with": {
      "database": ["postgresql", "sqlite", "mysql"],
      "codegen": ["rust-sql"],
      "frontend": ["*"]
    }
  }
}
```

## Plugin Compatibility

### Validation Strategy

When coordinating plugins, verify compatibility:

1. **Category requirements**: Backend plugins require database + codegen
2. **Technology alignment**: Codegen must match backend technology (e.g., rust-sql requires rust backend)
3. **Database compatibility**: Codegen must support the selected database
4. **Version constraints**: Check semantic version compatibility

### Compatibility Matrix Example

```
Backend: rust-axum
  ├─ Requires: database plugin, codegen plugin
  ├─ Compatible databases: postgresql, sqlite, mysql
  └─ Compatible codegen: rust-sql

Database: sqlite
  ├─ Compatible backends: rust, node, python, go
  └─ Compatible codegen: rust-sql, ts-prisma, go-sqlc

Codegen: rust-sql
  ├─ Requires backend: rust-*
  ├─ Compatible databases: postgresql, sqlite, mysql
  └─ Provides: type-safe SQL access, compile-time verification
```

## Integration Patterns

### Pattern 1: Plugin Orchestration Flow

```
Captain Orchestrator (Core)
    ↓
1. Apply Spec Changes
    ├─→ Database Plugin: Apply migrations
    └─→ Validate OpenAPI spec
    ↓
2. Code Generation
    ├─→ Codegen Plugin: Generate DB types and queries
    └─→ Backend Plugin: Generate API request/response types
    ↓
3. Handler Implementation
    └─→ Backend Plugin: Implement handlers using generated code
    ↓
4. Test & Iterate
    ├─→ Backend Plugin: Run tests
    ├─→ Codegen Plugin: Diagnose compilation errors
    └─→ Repeat until tests pass
```

### Pattern 2: Type Safety Chain

```
Database Schema (SQL)
    ↓ [Codegen Plugin: sql-gen/Prisma/sqlc]
Generated Types & Queries
    ↓ [Backend Plugin: Business Logic]
Handler Implementation
    ↓ [Backend Plugin: OpenAPI Types]
API Responses
```

### Pattern 3: Parallel Agent Execution

Spawn agents from different plugins in parallel:

```javascript
const tasks = [
  // Backend plugin agents
  {
    plugin: "backend",
    agent: "handler-agent",
    endpoint: "/users",
    model: "haiku",
  },
  {
    plugin: "backend",
    agent: "handler-agent",
    endpoint: "/orders",
    model: "sonnet",
  },

  // Database plugin agent
  { plugin: "database", agent: "migration-agent", migration: "003_add_orders" },

  // Frontend plugin agents (if applicable)
  { plugin: "frontend", agent: "component-agent", component: "UserList" },
];

// Execute up to 5 concurrent agents
await executeParallel(tasks, { maxConcurrent: 5 });
```

## Skill Invocation Patterns

### Invoke Plugin Skills

Each plugin exposes skills that can be invoked programmatically:

```javascript
// Database plugin: Apply migrations
await invokeSkill(`${databasePlugin.name}/migrations-expert`, {
  action: "apply-migrations",
  migrations_dir: "migrations/",
  database_url: process.env.DATABASE_URL,
});

// Codegen plugin: Generate from schema
await invokeSkill(`${codegenPlugin.name}/codegen-expert`, {
  action: "generate-from-schema",
  schema_dir: "migrations/",
  output_dir: "backend/src/generated/db",
  database_url: process.env.DATABASE_URL,
});

// Backend plugin: Generate OpenAPI types
await invokeSkill(`${backendPlugin.name}/openapi-types-expert`, {
  action: "generate-types",
  spec: "spec/openapi.yaml",
  output: "backend/src/generated/api",
});
```

### Delegate to Plugin Agents

Delegate specific tasks to plugin agents:

```javascript
// Backend plugin: Implement handler
await invokeAgent(`${backendPlugin.name}/handler-agent`, {
  model: endpoint.complexity === "simple" ? "haiku" : "sonnet",
  endpoint: endpoint,
  generated_db_types: `backend/src/generated/db`,
  generated_api_types: `backend/src/generated/api`,
});

// Codegen plugin: Diagnose compilation errors
await invokeAgent(`${codegenPlugin.name}/diagnostics-agent`, {
  model: "sonnet",
  handler_path: "backend/src/handlers/users.rs",
  errors: compilationErrors,
  generated_code_path: "backend/src/generated/db",
});
```

## Common Integration Challenges

### Challenge 1: Plugin Not Found

**Problem**: Required plugin is not installed

**Solution**:

1. Check if plugin exists in marketplace
2. Install plugin: `/plugin install {plugin-name}`
3. Update `CLAUDE.md` with plugin configuration

### Challenge 2: Compatibility Mismatch

**Problem**: Selected plugins are incompatible

**Solution**:

1. Read plugin manifests to check `compatible_with` declarations
2. Suggest alternative plugin combinations
3. Update plugin selection to ensure compatibility

### Challenge 3: Version Conflicts

**Problem**: Plugin versions have breaking changes

**Solution**:

1. Check semantic versions in plugin manifests
2. Use version ranges in compatibility declarations
3. Create lock file (`.specforge/plugin-lock.json`) for reproducibility

### Challenge 4: Missing Generated Code

**Problem**: Handler expects generated types that don't exist

**Solution**:

1. Verify codegen pipeline ran successfully
2. Check output directory paths match expectations
3. Re-run code generation if needed
4. Ensure build integration is configured

### Challenge 5: Context Budget Exceeded

**Problem**: Too many plugins loading too much context

**Solution**:

1. Check each plugin's context budget in agent metadata
2. Use selective context loading (only relevant sections)
3. Persist state to `.specforge/state.json` to reduce repeated reads
4. Enforce total context budget (<100K tokens)

## Configuration Management

### Project Configuration: CLAUDE.md

Store selected plugins in the project's `CLAUDE.md`:

```markdown
## SpecForge configuration (EDIT ONLY IF YOU ARE SPECFORGE AGENT)

- backend: rust-axum
- database: sqlite
- codegen: rust-sql
- frontend: react-tanstack
```

### Lock File: .specforge/plugin-lock.json

Track exact plugin versions for reproducibility:

```json
{
  "plugins": {
    "specforge-backend-rust-axum": {
      "version": "1.2.3",
      "resolved": "github:claude-market/marketplace/specforge-backend-rust-axum#v1.2.3"
    },
    "specforge-db-sqlite": {
      "version": "1.0.5",
      "resolved": "github:claude-market/marketplace/specforge-db-sqlite#v1.0.5"
    },
    "specforge-generate-rust-sql": {
      "version": "2.0.1",
      "resolved": "github:claude-market/marketplace/specforge-generate-rust-sql#v2.0.1"
    }
  }
}
```

### State Tracking: .specforge/state.json

Track build state to enable incremental operations:

```json
{
  "last_build": "2025-11-02T20:30:00Z",
  "spec_hash": "abc123...",
  "schema_hash": "def456...",
  "generated_code": {
    "backend/src/generated/db": "2025-11-02T20:25:00Z",
    "backend/src/generated/api": "2025-11-02T20:26:00Z"
  },
  "handlers": [
    { "path": "/users", "status": "implemented", "tests_passing": true },
    { "path": "/orders", "status": "implemented", "tests_passing": true }
  ]
}
```

## Docker Compose Integration

### Aggregating Plugin Configurations

Each plugin can contribute to Docker Compose configuration:

```yaml
# docker/docker-compose.yml
version: "3.8"

services:
  # From backend plugin
  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: sqlite://dev.db
    depends_on:
      db:
        condition: service_healthy

  # From database plugin
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]

  # From frontend plugin (if selected)
  web:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3000
```

### Plugin Docker Contributions

Each plugin provides Docker configuration snippets:

1. **Backend Plugin**: Application service definition, build configuration
2. **Database Plugin**: Database service with health checks
3. **Frontend Plugin**: Frontend service with build and environment

Aggregate these contributions into a single `docker-compose.yml`.

## Validation Workflow

### Pre-Build Validation

Before starting build process:

1. **Verify all required plugins are installed**

   ```bash
   # Check if plugins exist
   /plugin list | grep specforge-backend-rust-axum
   /plugin list | grep specforge-db-sqlite
   /plugin list | grep specforge-generate-rust-sql
   ```

2. **Validate plugin compatibility**

   - Read each plugin's manifest
   - Check `requires` and `compatible_with` fields
   - Ensure no conflicts

3. **Verify OpenAPI spec is valid**

   ```bash
   # Use redocly or other validator
   redocly lint spec/openapi.yaml
   ```

4. **Verify database schema is valid**
   - Check migration files syntax
   - Ensure sequential migration numbering

### Post-Build Validation

After build completes:

1. **Verify generated code exists**

   - Check expected output directories
   - Verify file structure matches expectations

2. **Run compilation checks**

   ```bash
   # Backend compilation
   cd backend && cargo check
   # or npm run typecheck, etc.
   ```

3. **Run test suites**
   ```bash
   # Backend tests
   cd backend && cargo test
   # Integration tests
   cd tests && npm test
   ```

## Resources

### SpecForge Ecosystem

- Core Plugin Documentation: `{baseDir}/README.md`
- Plugin Discovery: GitHub API or marketplace CLI
- Compatibility Matrix: Community-maintained spreadsheet

### Plugin Development

- Plugin Builder: `/plugin-builder:init`
- Plugin Validation: `/plugin-builder:validate`
- Plugin Publishing: `/plugin-builder:publish`

### External Tools

- OpenAPI Generator: https://openapi-generator.tech/
- Docker Compose: https://docs.docker.com/compose/
- Semantic Versioning: https://semver.org/

## Best Practices

1. **Always verify compatibility before plugin installation**
2. **Use lock files for reproducible builds**
3. **Track state to enable incremental operations**
4. **Enforce context budgets to prevent bloat**
5. **Delegate to specialized plugin agents when possible**
6. **Use parallel execution for independent tasks**
7. **Provide clear error messages with actionable solutions**
8. **Keep plugin manifests up to date with compatibility info**

## Example Integration Workflow

### Complete Build Orchestration

```javascript
// 1. Discover and validate plugins
const backend = await discoverPlugin("backend", "rust-axum");
const database = await discoverPlugin("database", "sqlite");
const codegen = await discoverPlugin("codegen", "rust-sql");
await validateCompatibility(backend, database, codegen);

// 2. Apply spec changes
await invokeSkill(`${database.name}/migrations-expert`, {
  action: "apply-migrations",
  migrations_dir: "migrations/",
});

// 3. Run code generation
await invokeSkill(`${codegen.name}/codegen-expert`, {
  action: "generate-from-schema",
  schema_dir: "migrations/",
  output_dir: "backend/src/generated/db",
});

await invokeSkill(`${backend.name}/openapi-types-expert`, {
  action: "generate-types",
  spec: "spec/openapi.yaml",
  output: "backend/src/generated/api",
});

// 4. Implement handlers in parallel
const endpoints = await parseOpenAPISpec("spec/openapi.yaml");
const results = await Promise.all(
  endpoints.map((endpoint) =>
    invokeAgent(`${backend.name}/handler-agent`, {
      model: endpoint.complexity === "simple" ? "haiku" : "sonnet",
      endpoint: endpoint,
      generated_db_types: "backend/src/generated/db",
      generated_api_types: "backend/src/generated/api",
    })
  )
);

// 5. Test and iterate
for (const result of results) {
  let success = false;
  let iterations = 0;

  while (!success && iterations < 3) {
    const testResult = await invokeAgent(`${backend.name}/test-agent`, {
      handler_path: result.path,
      endpoint: result.endpoint,
    });

    if (testResult.status === "passed") {
      success = true;
      break;
    }

    // Diagnose and fix
    await invokeAgent(`${codegen.name}/diagnostics-agent`, {
      model: "sonnet",
      errors: testResult.errors,
      handler_path: result.path,
    });

    iterations++;
  }
}

// 6. Update state
await updateState({
  last_build: new Date(),
  handlers: results.map((r) => ({
    path: r.endpoint.path,
    status: "implemented",
    tests_passing: true,
  })),
});
```

This integration expert skill ensures smooth coordination between all SpecForge plugins, maintaining type safety and compatibility throughout the development workflow.
