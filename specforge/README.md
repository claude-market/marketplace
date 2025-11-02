# SpecForge

**Schema-first development ecosystem with dual-spec workflows (OpenAPI + DB schema) for building production-ready applications through deterministic code generation and intelligent orchestration.**

## Overview

SpecForge is a multi-plugin ecosystem for Claude Code that implements complete **schema-first, DB-first** development workflows. The core plugin provides orchestration, planning, and validation, while modular plugins handle database tooling, code generation pipelines, and framework patterns.

### Core Innovation

Dual-spec approach where both OpenAPI and database schemas drive code generation. Separate codegen pipeline plugins bridge the gap between backend frameworks and databases, ensuring type-safe, compile-time verified database operations.

## Installation

```bash
# Install core plugin
/plugin marketplace add claude-market/marketplace
/plugin install specforge

# Install stack plugins (THREE required: backend, database, codegen)
/plugin install specforge-backend-rust-axum
/plugin install specforge-db-sqlite
/plugin install specforge-generate-rust-sql

# Optional: frontend plugin
/plugin install specforge-frontend-react-tanstack
```

## Commands

### `/specforge:init`

Initialize a SpecForge project with tech stack selection.

**What it does:**

- Discovers available stack plugins from the marketplace
- Presents interactive stack selection (backend, database, codegen, frontend)
- Generates project structure
- Creates initial OpenAPI spec template
- Configures Docker Compose
- Updates CLAUDE.md with selected stack

**Usage:**

```bash
/specforge:init
```

**Output:**

- `spec/openapi.yaml` - OpenAPI specification
- `backend/` - Backend code directory
- `frontend/` - Frontend code directory (if selected)
- `docker/docker-compose.yml` - Docker configuration
- `CLAUDE.md` - Updated with SpecForge configuration

### `/specforge:plan`

Generate implementation plan with dual-spec changes (OpenAPI + DB schema).

**What it does:**

- Analyzes feature requirements
- Proposes coordinated changes to OpenAPI spec and database schema
- Identifies required code generation
- Plans handler implementation strategy
- Estimates complexity and suggests appropriate agents

**Usage:**

```bash
/specforge:plan
```

**Example:**

```bash
# After editing spec/openapi.yaml to add new endpoints
/specforge:plan
```

**Output:**

- Implementation plan with spec changes
- Database migration files (proposed)
- Code generation requirements
- Handler implementation strategy
- Testing plan

### `/specforge:build`

Apply specs, generate code, implement handlers with test-driven iteration.

**What it does:**

- Applies database migrations
- Validates OpenAPI spec
- Runs code generation pipeline (DB schema → types)
- Generates OpenAPI types
- Implements endpoint handlers in parallel
- Runs test-driven iteration until all tests pass
- Wires handlers to router

**Usage:**

```bash
/specforge:build
```

**Orchestration Flow:**

1. **Phase 1**: Apply spec changes (migrations, OpenAPI validation)
2. **Phase 2**: Code generation (DB types, API types, frontend client)
3. **Phase 3**: Handler implementation (parallel execution)
4. **Phase 4**: Test & iterate (behavior observation, diagnostics)
5. **Phase 5**: Integration & verification

### `/specforge:sync`

Synchronize codebase after manual spec changes (OpenAPI + DB schema).

**What it does:**

- Detects changes to OpenAPI spec and database migrations
- Validates updated specifications
- Applies new database migrations (with confirmation)
- Regenerates type-safe code from updated schemas
- Identifies affected handlers that need updates
- Compiles and tests to verify everything still works
- Reports what changed and what needs attention

**When to use:**

- After manually editing `spec/openapi.yaml`
- After pulling changes from version control
- After adding/modifying database migrations
- After resolving merge conflicts in specs

**Usage:**

```bash
# Sync after spec changes
/specforge:sync

# Dry run (show what would happen)
/specforge:sync --dry-run
```

**Example Workflow:**

```bash
# Teammate added new endpoints
git pull origin main

# Sync to regenerate code
/specforge:sync

# Output shows:
# - 1 migration applied
# - Database models regenerated
# - API types regenerated
# - 2 handlers need updates
#
# Next: /specforge:build (to update affected handlers)
```

**Sync vs Build:**

- **`/specforge:sync`**: Regenerates code from externally changed specs
- **`/specforge:build`**: Applies specs + implements handlers in one go

**Output:**

- List of detected changes
- Migration application results
- Regenerated code files
- Affected handlers report
- Test results summary
- Suggested next steps

### `/specforge:validate`

Multi-level validation (spec, schema, code, runtime) for SpecForge projects.

**What it does:**

- **Level 1**: OpenAPI spec validation (compliance, schema correctness)
- **Level 2**: Database schema validation (migrations, constraints)
- **Level 3**: Code generation validation (types, queries generated correctly)
- **Level 4**: Compilation validation (no type errors, linting)
- **Level 5**: Runtime validation (tests pass, contract testing)

**Usage:**

```bash
# Quick validation (spec, schema, compile)
/specforge:validate

# Full validation including runtime tests
/specforge:validate --full

# Specific level validation
/specforge:validate --level spec
/specforge:validate --level schema
/specforge:validate --level codegen
/specforge:validate --level compile
/specforge:validate --level runtime
```

**Output:**

- Validation report with pass/fail status for each level
- Detailed error messages for failures
- Recommendations for fixes
- Exit codes for CI/CD integration

**Validation Levels:**

1. **Spec Validation**: OpenAPI 3.x compliance, schema definitions, examples
2. **Schema Validation**: Migration consistency, constraints, indexes
3. **Codegen Validation**: Generated code exists, types match schemas
4. **Compile Validation**: No compilation errors, linting passes
5. **Runtime Validation**: Tests pass, API matches spec

### `/specforge:test`

Test orchestration with behavior observation and iterative fixing.

**What it does:**

- Runs unit tests with coverage reporting
- Runs integration tests (end-to-end API flows)
- Performs contract testing against OpenAPI spec
- Observes test execution behavior to identify patterns
- Diagnoses failures using specialized agents
- Iteratively fixes issues (max 3 iterations)
- Generates comprehensive test reports

**Usage:**

```bash
# Quick test (unit + integration)
/specforge:test

# Full test including contract tests
/specforge:test --full

# Specific test suite
/specforge:test --suite unit
/specforge:test --suite integration
/specforge:test --suite contract

# Watch mode (run on file changes)
/specforge:test --watch
```

**Test Levels:**

1. **Unit Tests**: Test individual handlers and functions
2. **Integration Tests**: Test API endpoints end-to-end with database
3. **Contract Tests**: Verify API responses match OpenAPI spec using Schemathesis
4. **Behavior Observation**: Monitor execution to identify failure patterns
5. **Iterative Fixing**: Auto-diagnose and fix common issues

**Test Report Includes:**

- Pass/fail summary for each test suite
- Code coverage metrics (line, branch, function)
- Performance metrics (response times)
- Detailed failure diagnostics
- Iteration history (what was fixed and how)
- Recommendations for additional tests

**Example Output:**

```
SpecForge Test Report

Summary:
- ✓ Unit Tests: 45/45 passed (100%)
- ✓ Integration Tests: 12/12 passed (100%)
- ✓ Contract Tests: 8/8 passed (100%)
Total: 65/65 tests passed

Coverage:
- Line Coverage: 87%
- Branch Coverage: 82%
- Function Coverage: 95%

Iterations: 2
- Iteration 1: Fixed 3 type mismatches
- Iteration 2: All tests passed ✓
```

### `/specforge:ship`

Deployment preparation.

**What it does:**

- Validates project is production-ready
- Builds Docker images
- Runs security scans
- Generates deployment artifacts
- Creates deployment documentation

**Usage:**

```bash
/specforge:ship
```

**Coming soon:** Full implementation based on SPECFORGE_PLAN.md

## Workflow

### 1. Initialize Project

```bash
/specforge:init
```

Select your tech stack (backend, database, codegen, frontend).

### 2. Design API

Edit `spec/openapi.yaml` to define your API endpoints, schemas, and business logic.

### 3. Plan Implementation

```bash
/specforge:plan
```

Review the proposed implementation plan including database schema changes.

### 4. Build Application

```bash
/specforge:build
```

SpecForge orchestrates code generation and handler implementation.

### 5. Validate Everything

```bash
/specforge:validate
```

Run multi-level validation to ensure correctness.

### 6. Test

```bash
/specforge:test
```

Run comprehensive tests with behavior observation.

### 7. Deploy

```bash
/specforge:ship
```

Prepare for production deployment.

## Architecture

### Multi-Plugin Ecosystem

```
┌──────────────────────────────────────────────────────────┐
│                   specforge (core)                        │
│  Orchestration, Planning, Validation, Dual-Spec Workflow │
└────────────────────┬─────────────────────────────────────┘
                     │
         ┌───────────┼───────────┬──────────────┐
         ▼           ▼           ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌──────────┐ ┌─────────────┐
│  Backend    │ │  Database   │ │ Codegen  │ │  Frontend   │
│  Plugins    │ │  Plugins    │ │ Pipeline │ │  Plugins    │
│ (patterns)  │ │ (tooling)   │ │ Plugins  │ │             │
└─────────────┘ └─────────────┘ └──────────┘ └─────────────┘
```

### Plugin Categories

1. **Backend Plugins** (`specforge-backend-{tech}-{framework}`)

   - Framework-specific patterns, handlers, middleware, error handling
   - Examples: `specforge-backend-rust-axum`, `specforge-backend-node-express`

2. **Database Plugins** (`specforge-db-{database}`)

   - Database tooling, migrations, health checks, Docker config
   - Examples: `specforge-db-postgresql`, `specforge-db-sqlite`

3. **Codegen Pipeline Plugins** (`specforge-generate-{tech}-{database}`)

   - Type-safe DB access code generation from schemas
   - Examples: `specforge-generate-rust-sql`, `specforge-generate-ts-prisma`

4. **Frontend Plugins** (`specforge-frontend-{framework}-{variant}`)
   - Frontend client generation, state management, components
   - Examples: `specforge-frontend-react-tanstack`, `specforge-frontend-vue-pinia`

## Agents

### `captain-orchestrator` (Sonnet)

Main coordination agent that:

- Reads project configuration
- Delegates to specialized agents
- Manages parallel execution
- Tracks overall state

### `planning-agent` (Sonnet)

Strategic planning agent that:

- Analyzes feature requirements
- Proposes dual-spec changes
- Identifies implementation strategy
- Estimates complexity

### `validation-agent` (Sonnet)

Deep debugging agent that:

- Diagnoses validation failures
- Analyzes error patterns
- Proposes fixes
- Verifies corrections

## Skills

### `openapi-expert`

OpenAPI specification best practices:

- Spec design patterns
- Validation rules
- Contract testing
- Documentation generation

### `stack-advisor`

Tech stack recommendations:

- Plugin compatibility
- Performance considerations
- Best practices for stack combinations
- Migration strategies

### `integration-expert`

Plugin composition strategies:

- How plugins work together
- Context optimization
- Parallel execution patterns
- State management

## Benefits

### 1. Type Safety Across the Stack

```
Database Schema (SQL)
    ↓ [sql-gen / Prisma / sqlc]
Generated Types & Queries
    ↓
Business Logic Handlers
    ↓
OpenAPI-Generated Types
    ↓
API Responses
```

Compile-time guarantees from database to API response.

### 2. Clear Separation of Concerns

- **Backend Plugin**: Framework patterns, business logic, HTTP handling
- **Database Plugin**: Database tooling, migrations, configuration
- **Codegen Plugin**: Bridge between DB and backend with type safety

### 3. Interoperability

Mix any backend + database + codegen plugin:

- `rust-axum` + `postgresql` + `rust-sql` ✓
- `node-express` + `sqlite` + `ts-prisma` ✓
- `go-gin` + `mysql` + `go-sqlc` ✓

### 4. Schema-First Approach

- Single source of truth (database schema)
- Verified at compile-time (no runtime SQL errors)
- Refactoring safety (schema changes propagate)
- Migration-driven (explicit, versioned evolution)

## Configuration

SpecForge configuration is stored in your project's `CLAUDE.md`:

```markdown
## SpecForge configuration (EDIT ONLY IF YOU ARE SPECFORGE AGENT)

- backend: rust-axum
- database: sqlite
- codegen: rust-sql
- frontend: react-tanstack (optional)
```

## Resources

- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [OpenAPI Best Practices](https://learn.openapis.org/best-practices.html)
- [SPECFORGE_PLAN.md](../../SPECFORGE_PLAN.md) - Full architectural specification

## Support

- **Issues**: Report bugs or request features at [GitHub Issues](https://github.com/claude-market/marketplace/issues)
- **Discussions**: Join the community discussion

## License

MIT License - see [LICENSE](./LICENSE) file for details
