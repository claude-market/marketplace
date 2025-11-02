# SpecForge: Schema-First Development Ecosystem

**A plugin-based, dual-spec development pipeline that transforms OpenAPI specifications AND database schemas into production-ready applications through deterministic code generation, type safety, and intelligent orchestration.**

---

## Executive Summary

SpecForge is a **multi-plugin ecosystem** for Claude Code that implements complete **schema-first, DB-first** development workflows. The core plugin provides orchestration, planning, and validation, while modular plugins handle database tooling, code generation pipelines, and framework patterns.

**Core Innovation**: Dual-spec approach where both OpenAPI and database schemas drive code generation. Separate codegen pipeline plugins (`specforge-generate-*`) bridge the gap between backend frameworks and databases, ensuring type-safe, compile-time verified database operations.

---

## Multi-Plugin Architecture

### The SpecForge Ecosystem

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
    │               │               │              │
    ▼               ▼               ▼              ▼
  rust-axum     postgresql    rust-sql        react-tanstack
  node-express  sqlite        ts-prisma       vue-pinia
  python-fastapi mysql        go-sqlc         next.js
  go-gin        mongodb       ...             svelte
```

**Key Architectural Change**: Code generation is handled by dedicated **codegen pipeline plugins** that bridge backend frameworks with databases. This ensures type-safe, schema-driven database operations with compile-time verification.

### Core Plugin: `specforge`

**Repository**: `specforge` (core plugin)
**Purpose**: Orchestration, planning, workflow management, validation

**Provides**:

- `/specforge:init` - Project initialization wizard
- `/specforge:plan` - Dual-spec planning (OpenAPI + DB schema changes)
- `/specforge:build` - Orchestrate schema application and code generation
- `/specforge:validate` - Multi-level validation (spec, schema, code, runtime)
- `/specforge:test` - Test orchestration with behavior observation
- `/specforge:ship` - Deployment preparation

**Agents**:

- `captain-orchestrator` (Sonnet) - Main coordination
- `planning-agent` (Sonnet) - Strategic planning
- `validation-agent` (Sonnet) - Deep debugging
- ... stack-specific agents for execution (mostly Haiku)

**Skills**:

- `openapi-expert` - OpenAPI spec best practices
- `stack-advisor` - Tech stack recommendations
- `integration-expert` - Plugin composition strategies

### Plugin Categories

SpecForge uses three plugin categories, each with specific responsibilities:

#### 1. Backend Plugins (Framework Patterns)

```
specforge-backend-{technology}-{framework}
```

**Purpose**: Framework-specific patterns, handlers, middleware, error handling

**Examples**:

- `specforge-backend-rust-axum`
- `specforge-backend-node-express`
- `specforge-backend-python-fastapi`
- `specforge-backend-go-gin`

#### 2. Database Plugins (Database Tooling)

```
specforge-db-{database}
```

**Purpose**: Database-specific tooling, migrations, health checks, Docker config

**Examples**:

- `specforge-db-postgresql`
- `specforge-db-sqlite`
- `specforge-db-mysql`
- `specforge-db-mongodb`

#### 3. Codegen Pipeline Plugins (Type-Safe DB Access)

```
specforge-generate-{technology}-{database}
```

**Purpose**: Bridge backend framework + database with compile-time type safety. Generate type-safe database clients, query builders, and ORM code from database schemas.

**Examples**:

- `specforge-generate-rust-sql` (uses [sql-gen](https://crates.io/crates/sql-gen))
- `specforge-generate-ts-prisma` (uses Prisma)
- `specforge-generate-go-sqlc` (uses sqlc)
- `specforge-generate-python-sqlalchemy`

#### 4. Frontend Plugins

```
specforge-frontend-{framework}-{variant}
```

**Examples**:

- `specforge-frontend-react-tanstack`
- `specforge-frontend-vue-pinia`
- `specforge-frontend-nextjs`
- `specforge-frontend-svelte`

---

## Plugin Interface (Contract)

All SpecForge plugins must implement a standard interface based on their category.

### Example Stack: Rust + Axum + SQLite

For a Rust/Axum backend with SQLite, you would install **three plugins**:

1. **`specforge-backend-rust-axum`** - Axum patterns, handler implementation
2. **`specforge-db-sqlite`** - SQLite tooling, migrations, Docker config
3. **`specforge-generate-rust-sql`** - Type-safe SQL codegen using [sql-gen](https://crates.io/crates/sql-gen)

### Plugin Manifest Schema

#### Backend Plugin Manifest

```json
{
  "name": "specforge-backend-rust-axum",
  "version": "1.0.0",
  "description": "Rust + Axum backend patterns and handler implementation",
  "keywords": ["specforge", "backend", "rust", "axum"],
  "skills": [
    "./skills/axum-patterns-expert.md",
    "./skills/rust-testing-expert.md",
    "./skills/rust-docker-expert.md"
  ],
  "agents": ["./agents/rust-handler-agent.md", "./agents/rust-test-agent.md"]
}
```

#### Database Plugin Manifest

```json
{
  "name": "specforge-db-sqlite",
  "version": "1.0.0",
  "description": "SQLite database tooling and migrations for SpecForge",
  "keywords": ["specforge", "database", "sqlite"],
  "skills": [
    "./skills/sqlite-expert.md",
    "./skills/sqlite-migrations-expert.md",
    "./skills/sqlite-docker-expert.md"
  ],
  "agents": ["./agents/sqlite-migration-agent.md"]
}
```

#### Codegen Pipeline Plugin Manifest

```json
{
  "name": "specforge-generate-rust-sql",
  "version": "1.0.0",
  "description": "Type-safe Rust SQL code generation using sql-gen",
  "keywords": ["specforge", "codegen", "rust", "sql", "sql-gen"],
  "skills": [
    "./skills/rust-sql-codegen-expert.md",
    "./skills/sql-gen-expert.md",
    "./skills/rust-sql-diagnostics-expert.md"
  ],
  "agents": [
    "./agents/rust-sql-codegen-agent.md",
    "./agents/rust-sql-diagnostics-agent.md"
  ]
}
```

### Standard Skills by Plugin Category

#### Backend Plugin Skills

Backend plugins provide framework-specific patterns and handler implementation:

##### 1. Patterns Expert Skill

**Skill**: `{framework}-patterns-expert.md`

**Purpose**: Framework-specific patterns, handlers, middleware, error handling

**Capabilities**:

- Implement CRUD operations using framework patterns
- Error handling and response formatting
- Middleware integration
- Logging and observability
- Request/response handling

##### 2. Testing Expert Skill

**Skill**: `{tech}-testing-expert.md`

**Purpose**: Framework-specific testing patterns

**Capabilities**:

- Unit test patterns
- Integration test setup
- Mock setup
- Test fixtures

##### 3. Docker Expert Skill

**Skill**: `{tech}-docker-expert.md`

**Purpose**: Containerization for the backend framework

**Capabilities**:

- Dockerfile generation
- Multi-stage builds
- Health checks
- Optimization

#### Database Plugin Skills

Database plugins provide database-specific tooling:

##### 1. Database Expert Skill

**Skill**: `{database}-expert.md`

**Purpose**: Database-specific best practices and configuration

##### 2. Migrations Expert Skill

**Skill**: `{database}-migrations-expert.md`

**Purpose**: Schema migrations and versioning

##### 3. Docker Expert Skill

**Skill**: `{database}-docker-expert.md`

**Purpose**: Database containerization and health checks

#### Codegen Pipeline Plugin Skills

Codegen plugins bridge backend frameworks with databases through type-safe code generation:

##### 1. Codegen Expert Skill

**Skill**: `{tech}-{db}-codegen-expert.md`

**Purpose**: Generate type-safe database access code from schemas

**Capabilities**:

- Run code generator tool (sql-gen, Prisma, sqlc, etc.)
- Generate type-safe query functions
- Generate database models/structs
- Set up codegen pipeline
- Configure build integration

##### 2. Tool Expert Skill

**Skill**: `{tool}-expert.md` (e.g., `sql-gen-expert.md`)

**Purpose**: Deep expertise in the specific codegen tool

**Capabilities**:

- Tool configuration
- Query patterns
- Performance optimization
- Tool-specific best practices

##### 3. Diagnostics Expert Skill

**Skill**: `{tech}-{db}-diagnostics-expert.md`

**Purpose**: Diagnose and fix codegen pipeline issues

**Capabilities**:

- Debug compilation errors from generated code
- Fix schema/query mismatches
- Resolve type conflicts
- Optimize generated code performance
- Troubleshoot build pipeline

**Example**: `rust-sql-codegen-expert.md` for `specforge-generate-rust-sql`

````markdown
---
name: rust-sql-codegen-expert
description: Expert in generating type-safe Rust SQL code using sql-gen from database schemas
keywords: [rust, codegen, sql, sql-gen, type-safe]
---

# Rust SQL Code Generation Expert

Generate type-safe Rust database access code from SQL schemas using [sql-gen](https://crates.io/crates/sql-gen).

## Tools & Resources

- **sql-gen**: https://crates.io/crates/sql-gen
- **Documentation**: https://docs.rs/sql-gen/latest/sql_gen/
- **SQLx**: https://github.com/launchbadge/sqlx (runtime dependency)

## Code Generation Process

### 1. Set Up sql-gen Configuration

Create `sql-gen.toml`:

```toml
[sql-gen]
schema_dir = "migrations"
output_dir = "src/generated/db"
database_url = "sqlite://dev.db"

[sql-gen.settings]
async_runtime = "tokio"
type_overrides = { "TIMESTAMP" = "chrono::DateTime<Utc>" }
```
````

### 2. Run Code Generation

```bash
# Generate Rust code from SQL schema
cargo sqlx-gen generate

# Or with sql-gen CLI
sql-gen generate --config sql-gen.toml
```

### 3. Generated Structure

```
src/
├── generated/
│   └── db/
│       ├── mod.rs              # Module exports
│       ├── schema.rs           # Table definitions
│       ├── queries.rs          # Type-safe query functions
│       └── models.rs           # Rust structs from DB schema
├── handlers/                    # Business logic (uses generated code)
└── main.rs
```

### 4. Generated Type-Safe Code

```rust
// src/generated/db/models.rs
// Generated from SQL schema
#[derive(Debug, Clone, sqlx::FromRow)]
pub struct User {
    pub id: i64,
    pub email: String,
    pub name: Option<String>,
    pub created_at: chrono::DateTime<Utc>,
}

// src/generated/db/queries.rs
// Generated type-safe query functions
pub async fn get_user_by_id(
    pool: &SqlitePool,
    id: i64,
) -> Result<Option<User>, sqlx::Error> {
    sqlx::query_as!(
        User,
        r#"SELECT id, email, name, created_at FROM users WHERE id = ?"#,
        id
    )
    .fetch_optional(pool)
    .await
}

pub async fn create_user(
    pool: &SqlitePool,
    email: &str,
    name: Option<&str>,
) -> Result<User, sqlx::Error> {
    sqlx::query_as!(
        User,
        r#"
        INSERT INTO users (email, name, created_at)
        VALUES (?, ?, datetime('now'))
        RETURNING id, email, name, created_at
        "#,
        email,
        name
    )
    .fetch_one(pool)
    .await
}
```

### 5. Build Integration

Add to `build.rs` for compile-time verification:

```rust
fn main() {
    // Verify database schema at compile time
    println!("cargo:rerun-if-changed=migrations/");
    println!("cargo:rerun-if-changed=sql-gen.toml");
}
```

## Diagnostics & Troubleshooting

Common issues and solutions:

### Schema/Type Mismatches

```rust
// ERROR: expected `i64`, found `String`
// Fix: Update sql-gen.toml type overrides
[sql-gen.settings]
type_overrides = { "user_id" = "i64" }
```

### Query Compilation Errors

```bash
# Run sqlx prepare to check queries
cargo sqlx prepare -- --lib

# Update queries in migrations/
```

## Additional Resources

- sql-gen documentation: https://docs.rs/sql-gen/
- SQLx compile-time verification: https://github.com/launchbadge/sqlx/blob/main/sqlx-cli/README.md
- Type-safe SQL patterns: https://github.com/launchbadge/sqlx/tree/main/examples

````

#### 2. Handler Implementation Skill

**Skill**: `{tech}-patterns-expert.md`

**Purpose**: Implement business logic in handlers

**Capabilities**:
- Understand framework-specific patterns
- Implement CRUD operations
- Error handling patterns
- Middleware integration
- Logging and observability

**Example**: `axum-patterns-expert.md`

```markdown
---
name: axum-patterns-expert
description: Expert in Axum web framework patterns, middleware, error handling, and best practices
keywords: [axum, rust, patterns, handlers, middleware]
---

# Axum Patterns Expert

Implement handlers and business logic using Axum framework patterns.

## Resources

- **Axum Documentation**: https://docs.rs/axum/latest/axum/
- **Error Handling Guide**: https://docs.rs/axum/latest/axum/error_handling/
- **Extractors Guide**: https://docs.rs/axum/latest/axum/extract/

## Handler Patterns

### Basic CRUD Handler

```rust
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use uuid::Uuid;

pub async fn create_user(
    State(db): State<DatabasePool>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<impl IntoResponse, ApiError> {
    // Validate request
    payload.validate()?;

    // Business logic
    let user = User {
        id: Uuid::new_v4(),
        email: payload.email,
        name: payload.name,
    };

    // Save to database
    sqlx::query!(
        "INSERT INTO users (id, email, name) VALUES ($1, $2, $3)",
        user.id, user.email, user.name
    )
    .execute(&db)
    .await?;

    Ok((StatusCode::CREATED, Json(user)))
}

pub async fn get_user(
    State(db): State<DatabasePool>,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, ApiError> {
    let user = sqlx::query_as!(User, "SELECT * FROM users WHERE id = $1", id)
        .fetch_optional(&db)
        .await?
        .ok_or(ApiError::NotFound)?;

    Ok(Json(user))
}
````

### Error Handling

```rust
#[derive(Debug)]
pub enum ApiError {
    NotFound,
    Validation(validator::ValidationErrors),
    Database(sqlx::Error),
    Internal(String),
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            ApiError::NotFound => (StatusCode::NOT_FOUND, "Resource not found".to_string()),
            ApiError::Validation(e) => (StatusCode::BAD_REQUEST, e.to_string()),
            ApiError::Database(e) => {
                tracing::error!("Database error: {:?}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal error".to_string())
            }
            ApiError::Internal(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
        };

        (status, Json(json!({ "error": message }))).into_response()
    }
}
```

### Middleware

```rust
use tower_http::{
    cors::CorsLayer,
    trace::TraceLayer,
};

pub fn create_router(db: DatabasePool) -> Router {
    Router::new()
        .route("/api/users", post(create_user).get(list_users))
        .route("/api/users/:id", get(get_user).delete(delete_user))
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
        .with_state(db)
}
```

## Testing Patterns

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use axum_test_helper::TestClient;

    #[tokio::test]
    async fn test_create_user() {
        let db = setup_test_db().await;
        let app = create_router(db);
        let client = TestClient::new(app);

        let response = client
            .post("/api/users")
            .json(&json!({
                "email": "test@example.com",
                "name": "Test User"
            }))
            .send()
            .await;

        assert_eq!(response.status(), StatusCode::CREATED);
    }
}
```

## Additional Resources

- Axum examples: https://github.com/tokio-rs/axum/tree/main/examples
- Tower middleware: https://docs.rs/tower/latest/tower/
- Testing guide: https://docs.rs/axum-test-helper/latest/axum_test_helper/

````

#### 3. Testing Skill

**Skill**: `{tech}-testing-expert.md`

**Purpose**: Generate and run tests

**Capabilities**:
- Unit test generation
- Integration test generation
- Mock setup
- Test fixtures
- Coverage reporting

#### 4. Docker Skill

**Skill**: `{tech}-docker-expert.md`

**Purpose**: Containerization for the technology

**Capabilities**:
- Dockerfile generation
- Docker compose service definition
- Health checks
- Multi-stage builds
- Optimization

### Standard Agents Each Plugin Provides

#### 1. Handler Agent

**Agent**: `{tech}-handler-agent.md`

**Model**: Haiku (simple) or Sonnet (complex)

**Purpose**: Implement endpoint handlers

**Delegated by**: Core captain-orchestrator

**Receives**:
```json
{
  "task": "implement-handler",
  "endpoint": {
    "path": "/api/users",
    "method": "POST",
    "description": "...",
    "requestBody": {...},
    "responses": {...}
  },
  "context": {
    "types": "...",
    "database_schema": "...",
    "patterns": "..."
  }
}
````

**Returns**:

```json
{
  "status": "completed",
  "files_modified": ["src/handlers/users.rs"],
  "tests_created": ["tests/users_test.rs"]
}
```

#### 2. Test Agent

**Agent**: `{tech}-test-agent.md`

**Model**: Haiku

**Purpose**: Generate and run tests

**Capabilities**:

- Generate unit tests from OpenAPI examples
- Generate integration tests
- Run test suite
- Report coverage

---

## Plugin Discovery & Composition

### How Core Discovers Plugins

The core `specforge` plugin discovers stack plugins by:

1. **Read project's CLAUDE.md** this should contain user's chosen tech stack
2. _If plugin is not available_ agent can install it with the relevant command

### Initialization Flow

When user runs `/specforge:init`:

1. **Search GitHub repository for available stacks**

```
curl -s https://api.github.com/repos/claude-market/marketplace/contents/ | jq -r '.[] | select(.type == "dir" and (.name | startswith("specforge-"))) | .name'
```

2. **Present interactive selection**

   ```
   Backend Framework:
   [x] Rust + Axum
   [ ] Node + Express

   Database:
   [x] PostgreSQL (Prisma)
   [ ] SQLite

   Frontend:
   [x] React (TanStack Query)
   [ ] Vue (Pinia)
   ```

3. **Update CLAUDE.md with selected stack**

   ```md
   ## SpecForge configuration (EDIT ONLY IF YOU ARE SPECFORGE AGENT)

   - backend: rust-axum
   - client: react-tanstack
   - database: postgresql
   ```

---

## Core Plugin Architecture

### `specforge` (Core Plugin)

```
specforge/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── init.md          # Project initialization
│   ├── plan.md          # Planning orchestrator
│   ├── build.md         # Build orchestrator
│   ├── validate.md      # Validation orchestrator
│   ├── test.md          # Test orchestrator
│   ├── ship.md          # Deployment orchestrator
│   └── sync.md          # Sync after spec changes
├── agents/
│   ├── captain-orchestrator.md    # Main coordination (Sonnet)
│   ├── planning-agent.md          # Strategic planning (Sonnet)
│   └── validation-agent.md        # Deep debugging (Sonnet)
├── skills/
│   ├── openapi-expert.md          # OpenAPI best practices
│   ├── stack-advisor.md           # Tech stack recommendations
│   └── integration-expert.md      # Plugin composition
├── lib/
│   ├── plugin-discovery.md        # How to discover stack plugins
│   ├── orchestration-patterns.md  # Orchestration strategies
│   └── context-optimization.md    # Context management
├── CODEOWNERS
├── README.md
└── LICENSE
```

### Command: `/specforge:init`

**Purpose**: Initialize project with stack selection

**Implementation**:

````markdown
---
name: init
description: Initialize a SpecForge project with tech stack selection
---

# SpecForge Initialization

Initialize a new SpecForge project by selecting your tech stack and configuring the development environment.

## Step 1: Discover available tech stack options

```
curl -s https://api.github.com/repos/claude-market/marketplace/contents/ | jq -r '.[] | select(.type == "dir" and (.name | startswith("specforge-"))) | .name'
```

## Step 2: Check for OpenAPI Spec

Look for existing OpenAPI specification:

```bash
# Common locations
spec/openapi.yaml
spec/openapi.json
api/openapi.yaml
openapi.yaml
```

If not found, offer to create one or provide examples.

## Step 3: Present Stack Selection

Use AskUserQuestion tool to present available stacks:

**Backend Selection**:

- Display backend plugins
- Provide brief description of each

**Database Selection**:

- Display database plugins compatible with chosen backend
- Show ORM/client library used
- Migration strategy

**Frontend Selection** (optional):

- Display frontend plugins
- Build tool information

## Step 4: Generate Project Structure

Create directory structure:

```
project/
├── spec/
│   └── openapi.yaml             # OpenAPI specification
├── backend/                     # Backend code
├── frontend/                    # Frontend code (if selected)
├── docker/                      # Docker configs
│   └── docker-compose.yml
├── tests/                       # Integration tests
└── README.md
```

## Step 6: Invoke Plugin Setup

Delegate to each selected plugin's setup skill:

```javascript
// Call backend plugin setup
await invokeSkill("rust-codegen-expert", {
  action: "initialize-project",
  spec_path: ".specforge/config.json",
  output_path: "backend/",
});

// Call database plugin setup
await invokeSkill("postgresql-prisma-expert", {
  action: "initialize-database",
  spec_path: "spec/openapi.yaml",
  output_path: "backend/prisma/",
});

// Call frontend plugin setup (if selected)
if (selectedPlugins.frontend) {
  await invokeSkill("react-tanstack-expert", {
    action: "initialize-frontend",
    api_url: "http://localhost:3000",
    output_path: "frontend/",
  });
}
```

## Step 7: Generate Docker Compose

Aggregate Docker configurations from all plugins:

```yaml
version: "3.8"

services:
  # From backend plugin
  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/app
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

## Step 8: Save Configuration

Write `CLAUDE.md`:

```md
## SpecForge configuration (EDIT ONLY IF YOU ARE SPECFORGE AGENT)

- backend: rust-axum
- database: sqlite
- codegen: rust-sql
- frontend: react-tanstack (optional)
```

**Note**: Three-plugin architecture requires all three: backend, database, and codegen.

## Resources

- **OpenAPI Specification**: https://spec.openapis.org/oas/latest.html
- **OpenAPI Examples**: https://github.com/OAI/OpenAPI-Specification/tree/main/examples
- **Claude Market Plugin Marketplace**: https://github.com/claude-market/marketplace

## Next Steps

After initialization:

1. Review/edit specs: `spec/openapi.yaml` and database schema
2. Generate implementation plan: `/specforge:plan`
3. Build the application: `/specforge:build`
````

---

## Dual-Spec Workflow

SpecForge's core innovation is treating **both OpenAPI and database schema as sources of truth**. Changes to features require coordinated updates to both specs.

### Command: `/specforge:plan`

**Purpose**: Generate implementation plan proposing changes to both specs

**Implementation**:

````markdown
---
name: plan
description: Generate implementation plan with dual-spec changes (OpenAPI + DB schema)
---

# SpecForge Planning Agent

Analyze feature requirements and propose coordinated changes to OpenAPI spec and database schema.

## Planning Process

### 1. Analyze Feature Requirements

Parse user requirements and identify:

- New API endpoints needed
- Database schema changes required
- Business logic complexity
- Integration points

### 2. Propose OpenAPI Spec Changes

```yaml
# spec/openapi.yaml (proposed changes)

paths:
  /api/users/{id}/orders:
    get:
      summary: Get user's orders
      description: |
        Retrieve all orders for a specific user.

        Business Logic:
        - Fetch user from database
        - Query orders with user_id foreign key
        - Include order items with product details
        - Calculate totals
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: User's orders
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Order"
```
````

### 3. Propose Database Schema Changes

```sql
-- migrations/003_add_orders.sql

CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_cents INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price_cents INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### 4. Generate Implementation Plan

```markdown
## Implementation Plan

### Spec Changes

1. OpenAPI: Add GET /api/users/{id}/orders endpoint
2. Database: Create orders and order_items tables with indexes

### Code Generation Required

- Codegen plugin will generate Rust types: Order, OrderItem
- Codegen plugin will generate type-safe queries: get_orders_by_user_id()

### Handler Implementation

- Implement get_user_orders() handler using generated types
- Business logic: fetch user, query orders with joins, format response

### Testing Strategy

- Unit test: get_user_orders() with mock data
- Integration test: Full flow from HTTP request to DB query
- Behavior observation: Verify correct SQL joins, response format

### Estimated Complexity

- Simple CRUD operation with joins
- Agent: Haiku (sufficient for generated types + straightforward logic)
```

## Resources

- OpenAPI planning best practices
- Database migration patterns
- Indexing strategies

`````

---

### Command: `/specforge:build`

**Purpose**: Apply schema changes, run code generation, implement handlers with test-driven iteration

**Orchestration Flow**:

```
Captain Orchestrator
↓
Phase 1: Apply Spec Changes
├─→ Apply OpenAPI spec changes
└─→ Apply database migrations (via DB plugin)
    ↓
Phase 2: Code Generation
├─→ Run codegen pipeline (generates types + queries from DB schema)
├─→ Generate OpenAPI types (request/response models)
└─→ Frontend client generation (if applicable)
    ↓
Phase 3: Handler Implementation
For each endpoint:
├─→ Delegate to backend handler agent
│   ├─→ Implement business logic using generated code
│   └─→ Write handler with generated types
└─→ Frontend component agent (if needed)
    ↓
Phase 4: Test & Iterate
├─→ Run test agent for each handler
├─→ Observe behavior (compile errors, runtime errors, test failures)
├─→ Diagnostics agent fixes issues
└─→ Repeat until tests pass
    ↓
Report completion
```

**Implementation**:

````markdown
---
name: build
description: Apply specs, generate code, implement handlers with test-driven iteration
---

# SpecForge Build Orchestrator

Apply spec changes, run code generation, implement handlers, test and iterate.

## Phase 1: Apply Spec Changes

### Apply Database Migrations

```javascript
// Database plugin applies migrations
await invokeSkill(`${databasePlugin.name}/migrations-expert`, {
  action: "apply-migrations",
  migrations_dir: "migrations/",
  database_url: process.env.DATABASE_URL,
});
```

### Verify OpenAPI Spec

```javascript
// Validate OpenAPI spec changes
await invokeSkill("openapi-expert", {
  action: "validate-spec",
  spec_path: "spec/openapi.yaml",
});
```

## Phase 2: Code Generation

### Run Codegen Pipeline (DB Schema → Types)

```javascript
// Codegen plugin generates type-safe DB access code
await invokeSkill(`${codegenPlugin.name}/codegen-expert`, {
  action: "generate-from-schema",
  schema_dir: "migrations/",
  output_dir: backendPlugin.path + "src/generated/db",
  database_url: process.env.DATABASE_URL,
});
```

### Generate OpenAPI Types

```javascript
// Backend plugin generates request/response types
await invokeSkill(`${backendPlugin.name}/openapi-types-expert`, {
  action: "generate-types",
  spec: "spec/openapi.yaml",
  output: backendPlugin.path + "src/generated/api",
});
```

### Frontend Client Generation (Optional)

```javascript
if (frontendPlugin) {
  await invokeSkill(`${frontendPlugin.name}/codegen-expert`, {
    action: "generate-client",
    spec: "spec/openapi.yaml",
    output: frontendPlugin.path + "src/api",
  });
}
```

## Phase 3: Handler Implementation

Parse OpenAPI spec and categorize endpoints:

```javascript
const spec = await parseOpenAPISpec("spec/openapi.yaml");
const endpoints = extractEndpoints(spec);

// Categorize by complexity
const simple = endpoints.filter((e) => isSimpleCRUD(e));
const complex = endpoints.filter((e) => !isSimpleCRUD(e));
```

### Parallel Handler Implementation

Spawn handler agents in parallel (up to 5 concurrent):

```javascript
const results = await Promise.all(
  endpoints.map(endpoint => {
    const agentModel = endpoint.complexity === 'simple' ? 'haiku' : 'sonnet';

    return invokeAgent(`${backendPlugin.name}/handler-agent`, {
      model: agentModel,
      endpoint: endpoint,
      // Provide paths to GENERATED code
      generated_db_types: `${backendPlugin.path}/src/generated/db`,
      generated_api_types: `${backendPlugin.path}/src/generated/api`,
      patterns: await getPatterns(backendPlugin)
    });
  })
);
```

**Handler agents MUST use generated types and queries**:

- Import generated DB models and query functions
- Import generated API request/response types
- Stitch together business logic using generated code
- NO manual SQL queries allowed

## Phase 4: Test & Iterate

For each implemented handler, run test-driven iteration:

```javascript
for (const handler of results) {
  let success = false;
  let iterationCount = 0;
  const MAX_ITERATIONS = 3;

  while (!success && iterationCount < MAX_ITERATIONS) {
    // Generate and run tests
    const testResult = await invokeAgent(`${backendPlugin.name}/test-agent`, {
      model: "haiku",
      handler_path: handler.path,
      endpoint: handler.endpoint,
      generated_types: handler.generated_types,
    });

    if (testResult.status === "passed") {
      success = true;
      console.log(`✓ ${handler.endpoint.path} tests passed`);
      break;
    }

    // Observe behavior and diagnose issues
    const diagnostic = await invokeAgent(
      `${codegenPlugin.name}/diagnostics-agent`,
      {
        model: "sonnet",
        handler_path: handler.path,
        errors: testResult.errors,
        compile_errors: testResult.compile_errors,
        generated_code_path: handler.generated_types,
      }
    );

    // Apply fixes
    await applyFixes(diagnostic.fixes);

    iterationCount++;
  }

  if (!success) {
    throw new Error(
      `Failed to get ${handler.endpoint.path} working after ${MAX_ITERATIONS} iterations`
    );
  }
}
```

## Phase 5: Integration & Verification

```javascript
// Wire up all handlers to router
await invokeSkill(`${backendPlugin.name}/integration-expert`, {
  action: "wire-handlers",
  handlers: results.map((r) => r.handler_path),
  output: backendPlugin.path + "src/main",
});

// Run full integration test suite
await invokeSkill("test-orchestrator", {
  action: "run-integration-tests",
  test_dir: "tests/integration",
});
```

## Resources

- **Parallel Agent Execution**: Max 5 concurrent handler agents
- **Context Budget**: Handler agents <5K tokens (Haiku) or <15K (Sonnet)
- **Test Iteration**: Max 3 iterations per handler before escalating
- **State Management**: Write results to `.specforge/state.json`

```

---

## Example Stack Plugins

### Example Stack: Rust + Axum + SQLite

For this stack, install **three plugins**:

#### 1. Backend Plugin: `specforge-backend-rust-axum`

```

specforge-backend-rust-axum/
├── .claude-plugin/
│ └── plugin.json
├── skills/
│ ├── axum-patterns-expert.md # Axum framework patterns
│ ├── rust-testing-expert.md # Rust testing strategies
│ └── rust-docker-expert.md # Rust Docker optimization
├── agents/
│ ├── rust-handler-agent.md # Implement handlers
│ └── rust-test-agent.md # Generate tests
├── templates/
│ ├── Cargo.toml.template
│ ├── main.rs.template
│ └── Dockerfile.template
├── CODEOWNERS
├── README.md
└── LICENSE

````

**plugin.json**:

```json
{
  "name": "specforge-backend-rust-axum",
  "version": "1.0.0",
  "description": "Rust + Axum backend patterns and handler implementation",
  "author": {
    "name": "SpecForge Community"
  },
  "license": "MIT",
  "keywords": ["specforge", "rust", "axum", "backend"],

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
  },

  "skills": [
    "./skills/axum-patterns-expert.md",
    "./skills/rust-testing-expert.md",
    "./skills/rust-docker-expert.md"
  ],

  "agents": [
    "./agents/rust-handler-agent.md",
    "./agents/rust-test-agent.md"
  ]
}
````

#### 2. Database Plugin: `specforge-db-sqlite`

```
specforge-db-sqlite/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── sqlite-expert.md             # SQLite best practices
│   ├── sqlite-migrations-expert.md  # Migration management
│   └── sqlite-docker-expert.md      # Docker configuration
├── agents/
│   └── sqlite-migration-agent.md    # Handle migrations
├── templates/
│   ├── migration.sql.template
│   └── docker-compose-db.yml.template
├── CODEOWNERS
├── README.md
└── LICENSE
```

**plugin.json**:

```json
{
  "name": "specforge-db-sqlite",
  "version": "1.0.0",
  "description": "SQLite database tooling and migrations",
  "keywords": ["specforge", "database", "sqlite"],

  "specforge": {
    "category": "database",
    "technology": "sqlite",
    "provides": {
      "tooling": true,
      "migrations": true,
      "docker": true
    },
    "compatible_with": {
      "backend": ["rust", "node", "python", "go"],
      "codegen": ["rust-sql", "ts-prisma", "go-sqlc"]
    }
  },

  "skills": [
    "./skills/sqlite-expert.md",
    "./skills/sqlite-migrations-expert.md",
    "./skills/sqlite-docker-expert.md"
  ],

  "agents": ["./agents/sqlite-migration-agent.md"]
}
```

#### 3. Codegen Pipeline Plugin: `specforge-generate-rust-sql`

```
specforge-generate-rust-sql/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── rust-sql-codegen-expert.md      # Code generation from schema
│   ├── sql-gen-expert.md               # sql-gen tool expertise
│   └── rust-sql-diagnostics-expert.md  # Diagnose codegen issues
├── agents/
│   ├── rust-sql-codegen-agent.md       # Run code generation
│   └── rust-sql-diagnostics-agent.md   # Fix compilation errors
├── templates/
│   ├── sql-gen.toml.template
│   └── build.rs.template
├── CODEOWNERS
├── README.md
└── LICENSE
```

**plugin.json**:

```json
{
  "name": "specforge-generate-rust-sql",
  "version": "1.0.0",
  "description": "Type-safe Rust SQL code generation using sql-gen",
  "keywords": ["specforge", "codegen", "rust", "sql", "sql-gen"],

  "specforge": {
    "category": "codegen",
    "technology": "rust",
    "database": "sql",
    "tool": "sql-gen",
    "provides": {
      "codegen": true,
      "diagnostics": true,
      "build_integration": true
    },
    "requires": {
      "categories": ["backend", "database"]
    },
    "compatible_with": {
      "backend": ["rust-axum"],
      "database": ["postgresql", "sqlite", "mysql"]
    }
  },

  "skills": [
    "./skills/rust-sql-codegen-expert.md",
    "./skills/sql-gen-expert.md",
    "./skills/rust-sql-diagnostics-expert.md"
  ],

  "agents": [
    "./agents/rust-sql-codegen-agent.md",
    "./agents/rust-sql-diagnostics-agent.md"
  ]
}
```

---

## Key Benefits of Schema-First, Three-Plugin Architecture

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

**Compile-time guarantees from database to API response.**

### 2. Clear Separation of Concerns

- **Backend Plugin**: Framework patterns, business logic, HTTP handling
- **Database Plugin**: Database tooling, migrations, configuration
- **Codegen Plugin**: Bridge between DB and backend with type safety

Each plugin has a focused responsibility, making the ecosystem easier to extend and maintain.

### 3. Interoperability

Any backend + any database + appropriate codegen plugin:

- `rust-axum` + `postgresql` + `rust-sql` ✓
- `rust-axum` + `sqlite` + `rust-sql` ✓
- `node-express` + `postgresql` + `ts-prisma` ✓
- `go-gin` + `postgresql` + `go-sqlc` ✓
- `python-fastapi` + `mysql` + `python-sqlalchemy` ✓

### 4. Diagnostics & Iteration

Dedicated diagnostics agents in codegen plugins can:

- Diagnose compilation errors from generated code
- Fix schema/type mismatches
- Resolve query compilation errors
- Optimize generated code performance
- Troubleshoot build pipeline issues

This enables the **test-and-iterate workflow** in Phase 4 of the build process.

### 5. Schema-First Approach Advantages

- **Single source of truth**: Database schema defines data model
- **Verified at compile-time**: No runtime SQL errors
- **Refactoring safety**: Schema changes propagate through generated code
- **Documentation**: Schema IS documentation
- **Migration-driven**: Database evolution is explicit and versioned

---

## Context Engineering Strategy

### Hierarchical Context Distribution

```
Captain Orchestrator (Sonnet - 15K tokens)
    ├─ High-level config
    ├─ OpenAPI endpoint list
    ├─ Plugin inventory
    └─ State tracking
        │
        ├─→ Planning Agent (Sonnet - 10K tokens)
        │       ├─ Full OpenAPI spec
        │       └─ Plugin capabilities
        │
        ├─→ Backend Handler Agent (Haiku - <5K tokens each)
        │       ├─ Single endpoint definition
        │       ├─ Generated types for that endpoint
        │       └─ Framework patterns
        │
        ├─→ Database Migration Agent (Haiku - <5K tokens)
        │       ├─ Schema changes
        │       └─ Migration templates
        │
        └─→ Frontend Component Agent (Haiku - <5K tokens each)
                ├─ Single endpoint client
                ├─ Component patterns
                └─ State management setup
```

### Model Selection by Plugin

Each plugin specifies preferred models in agent definitions:

```markdown
---
name: rust-handler-agent
model: haiku # or sonnet for complex logic
context_budget: 5000
---
```

The captain respects these preferences when delegating.

### Parallel Execution

```
Captain spawns agents in parallel across plugins:

┌─────────────────────────────────────────┐
│ Parallel Agent Execution (5 concurrent) │
├─────────────────────────────────────────┤
│ Backend Handler: POST /users    (Haiku) │
│ Backend Handler: GET /users/:id (Haiku) │
│ Frontend Comp: UserList         (Haiku) │
│ DB Migration: CreateUsersTable  (Haiku) │
│ Backend Handler: POST /orders   (Sonnet)│
└─────────────────────────────────────────┘

Total context: 24K tokens distributed
vs Sequential: 24K × 5 = 120K tokens
```

---

## Integration with Existing Tools

### OpenAPI Code Generators

Each backend plugin uses appropriate generator:

- **Rust**: [openapi-generator](https://openapi-generator.tech/docs/generators/rust-axum) or [utoipa](https://github.com/juhaku/utoipa)
- **Node/TypeScript**: [openapi-generator](https://openapi-generator.tech/docs/generators/typescript-express) or [tsoa](https://github.com/lukeautry/tsoa)
- **Python**: [fastapi-code-generator](https://github.com/koxudaxi/fastapi-code-generator) or [openapi-python-client](https://github.com/openapi-generators/openapi-python-client)
- **Go**: [oapi-codegen](https://github.com/deepmap/oapi-codegen) or [openapi-generator](https://openapi-generator.tech/docs/generators/go-gin-server)

References:

- OpenAPI Generator: https://openapi-generator.tech/
- OpenAPI Tools List: https://openapi.tools/

### Validation Tools

- **Spec Validation**: [Redocly CLI](https://redocly.com/docs/cli/) - `redocly lint openapi.yaml`
- **Contract Testing**: [Schemathesis](https://schemathesis.readthedocs.io/) - Property-based testing for APIs
- **API Mocking**: [Prism](https://stoplight.io/open-source/prism) - Mock server from OpenAPI spec

### Testing Integration

- **E2E Testing**: [Playwright MCP](https://github.com/microsoft/playwright-mcp) - Browser automation without vision models
- **Contract Testing**: [Pact](https://docs.pact.io/) - Consumer-driven contract testing
- **Load Testing**: [k6](https://k6.io/) - Performance testing

### Docker & Orchestration

- **Local Development**: [Docker Compose](https://docs.docker.com/compose/) - Multi-container local dev
- **Health Checks**: [Docker health check](https://docs.docker.com/engine/reference/builder/#healthcheck) - Service readiness
- **Container Scanning**: [Trivy](https://aquasecurity.github.io/trivy/) - Security vulnerabilities

---

## OpenAPI Spec Best Practices

For SpecForge to work optimally, OpenAPI specs should be rich with information.

### Reference: OpenAPI Specification

- **Official Spec**: https://spec.openapis.org/oas/latest.html
- **OpenAPI Guide**: https://learn.openapis.org/
- **Best Practices**: https://learn.openapis.org/best-practices.html

### 1. Detailed Descriptions

```yaml
paths:
  /orders:
    post:
      summary: Create a new order
      description: |
        Creates a new order for the authenticated user.

        Business Logic:
        1. Validate user has payment method on file
        2. Check inventory availability for all items
        3. Calculate total price including tax and shipping
        4. Reserve inventory for 10 minutes
        5. Create order in "pending" state
        6. Send order confirmation email
        7. Return order details with payment URL

        Edge Cases:
        - If inventory insufficient, return 409 with available quantity
        - If user has no payment method, return 400 with setup URL
        - If total exceeds credit limit, return 402

        Performance: Target response time <500ms
```

### 2. Comprehensive Examples

```yaml
requestBody:
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/CreateOrderRequest"
      examples:
        simple:
          summary: Simple order
          value:
            items:
              - productId: "prod_123"
                quantity: 2
            shippingAddressId: "addr_456"

        with-coupon:
          summary: Order with coupon code
          value:
            items:
              - productId: "prod_123"
                quantity: 2
            shippingAddressId: "addr_456"
            couponCode: "SAVE20"
```

### 3. Detailed Error Responses

```yaml
responses:
  "201":
    description: Order created successfully
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/Order"
  "400":
    description: Invalid request
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/Error"
        examples:
          no-payment-method:
            value:
              error: "NO_PAYMENT_METHOD"
              message: "No payment method on file"
              action_url: "https://example.com/setup-payment"
  "409":
    description: Insufficient inventory
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/InventoryError"
        example:
          error: "INSUFFICIENT_INVENTORY"
          productId: "prod_123"
          available: 1
          requested: 2
```

### 4. Schema Validation Rules

```yaml
components:
  schemas:
    CreateUserRequest:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
          description: User's email address (must be unique)
          example: "user@example.com"
        password:
          type: string
          minLength: 8
          maxLength: 100
          pattern: '^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$'
          description: Password (min 8 chars, must contain letter and number)
        name:
          type: string
          minLength: 2
          maxLength: 100
          description: User's display name
```

Reference: [OpenAPI Data Types](https://swagger.io/docs/specification/data-models/data-types/)

---

## Success Metrics

### Developer Experience

- **Time to working API**: <15 minutes (from spec to running locally)
- **Code generated**: 80-90% of boilerplate
- **Context usage**: <100K tokens for 20-endpoint API
- **Cost per project**: <$5 in AI inference costs

### Code Quality

- **Test coverage**: >80% auto-generated
- **Type safety**: 100% (derived from OpenAPI)
- **Spec compliance**: 100% (validated automatically)
- **Security**: Automated scanning, no OWASP Top 10 vulnerabilities

### Ecosystem Scalability

- **Plugin composability**: Any backend + any database + any frontend
- **Community plugins**: Easy to create and distribute
- **Version compatibility**: Semantic versioning with compatibility matrix

---

## Community Contribution

### Creating a New Stack Plugin

**Resources**:

- [Creating Claude Code Plugins](https://docs.claude.com/claude-code/plugins/creating-plugins)
- [Plugin Builder](https://github.com/claude-market/marketplace/tree/main/plugin-builder)

**Steps**:

1. **Use plugin-builder to scaffold**:

   ```bash
   /plugin-builder:init
   # Name: specforge-backend-kotlin-ktor
   # Type: Skill-based plugin
   ```

2. **Add specforge metadata to plugin.json**:

   ```json
   {
     "specforge": {
       "category": "backend",
       "technology": "kotlin",
       "variant": "ktor",
       "provides": {
         "codegen": true,
         "handlers": true,
         "testing": true,
         "docker": true
       },
       "compatible_with": {
         "database": ["postgresql", "mongodb"],
         "frontend": ["*"]
       }
     }
   }
   ```

3. **Create required skills**:

   - `kotlin-codegen-expert.md` - Code generation from OpenAPI
   - `ktor-patterns-expert.md` - Framework patterns
   - `kotlin-testing-expert.md` - Testing strategies
   - `kotlin-docker-expert.md` - Containerization

4. **Create required agents**:

   - `kotlin-handler-agent.md` - Implement endpoints
   - `kotlin-test-agent.md` - Generate tests

5. **Test integration**:

   ```bash
   /specforge:init
   # Select your new plugin
   /specforge:build
   # Verify it generates correct code
   ```

6. **Submit to marketplace**:
   ```bash
   /plugin-builder:publish
   ```

**Plugin Template Structure**:

```
specforge-backend-{tech}-{variant}/
├── .claude-plugin/
│   └── plugin.json                  # With specforge metadata
├── skills/
│   ├── {tech}-codegen-expert.md     # Required
│   ├── {variant}-patterns-expert.md # Required
│   ├── {tech}-testing-expert.md     # Required
│   └── {tech}-docker-expert.md      # Required
├── agents/
│   ├── {tech}-handler-agent.md      # Required
│   └── {tech}-test-agent.md         # Required
├── templates/                       # Optional
│   ├── Dockerfile.template
│   └── docker-compose.yml.template
├── examples/                        # Recommended
│   └── simple-api/
├── CODEOWNERS
├── README.md                        # Must document usage
└── LICENSE
```

## Technical Challenges & Solutions

### Challenge 1: Plugin Discovery & Compatibility

**Problem**: How does core know which plugins work together?

**Solution**:

- Standardized `specforge.*` metadata in plugin manifests
- `compatible_with` declarations for cross-plugin compatibility
- Validation at initialization time
- Community-maintained compatibility matrix

### Challenge 2: Version Compatibility

**Problem**: Plugin versions may have breaking changes

**Solution**:

- Semantic versioning for all plugins
- Version ranges in `compatible_with` declarations
- Lock file (`.specforge/plugin-lock.json`) for reproducibility
- Automated compatibility testing in CI

### Challenge 3: Context Budget Across Plugins

**Problem**: Multiple plugins = potential context explosion

**Solution**:

- Each plugin specifies context budgets in agent metadata
- Captain enforces total context budget (<100K tokens)
- Plugins only receive relevant sections of OpenAPI spec
- State persistence in `.specforge/` reduces repeated reads

### Challenge 4: Plugin Quality & Maintenance

**Problem**: Community plugins may vary in quality

**Solution**:

- Plugin validation tool (`/plugin-builder:validate`)
- Required test suite for marketplace submission
- CODEOWNERS file required for each plugin
- Community ratings and reviews
- Official "verified" badge for high-quality plugins

### Challenge 5: Learning Curve

**Problem**: Users need to understand multiple plugins

**Solution**:

- Intelligent defaults (core suggests compatible plugins)
- Interactive `init` command with explanations
- Comprehensive README for each plugin
- Example projects for common stacks
- Video tutorials and documentation

---

## Reference Links

### OpenAPI Resources

- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [OpenAPI Guide](https://learn.openapis.org/)
- [OpenAPI Best Practices](https://learn.openapis.org/best-practices.html)
- [OpenAPI Examples](https://github.com/OAI/OpenAPI-Specification/tree/main/examples)

### Code Generation Tools

- [OpenAPI Generator](https://openapi-generator.tech/)
- [OpenAPI Tools Directory](https://openapi.tools/)
- [oapi-codegen (Go)](https://github.com/deepmap/oapi-codegen)
- [fastapi-code-generator (Python)](https://github.com/koxudaxi/fastapi-code-generator)
- [openapi-typescript](https://github.com/drwpow/openapi-typescript)

### Validation & Testing

- [Redocly CLI](https://redocly.com/docs/cli/) - OpenAPI linting
- [Schemathesis](https://schemathesis.readthedocs.io/) - Property-based API testing
- [Dredd](https://dredd.org/) - HTTP API testing
- [Prism](https://stoplight.io/open-source/prism) - OpenAPI mock server
- [Playwright MCP](https://github.com/microsoft/playwright-mcp) - Browser automation

### Claude Code Resources

- [Claude Code Documentation](https://docs.claude.com/claude-code)
- [Creating Plugins](https://docs.claude.com/claude-code/plugins/creating-plugins)
- [Plugin Builder](https://github.com/claude-market/marketplace/tree/main/plugin-builder)
- [Claude Code Marketplace](https://github.com/claude-market/marketplace)

### Docker & Containers

- [Docker Compose](https://docs.docker.com/compose/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Trivy Security Scanner](https://aquasecurity.github.io/trivy/)

### Framework-Specific

- **Rust**: [Axum](https://docs.rs/axum/), [Tokio](https://tokio.rs/)
- **Node**: [Express](https://expressjs.com/), [Fastify](https://fastify.dev/)
- **Python**: [FastAPI](https://fastapi.tiangolo.com/), [Flask](https://flask.palletsprojects.com/)
- **Go**: [Gin](https://gin-gonic.com/), [Echo](https://echo.labstack.com/)
- **React**: [React Docs](https://react.dev/), [TanStack Query](https://tanstack.com/query/latest)
- **Vue**: [Vue 3](https://vuejs.org/), [Pinia](https://pinia.vuejs.org/)

---

## Getting Started

### For Users

```bash
# 1. Install core plugin
/plugin marketplace add claude-market/marketplace
/plugin install specforge

# 2. Initialize project
/specforge:init

# 3. Init will install stack plugins (THREE required: backend, database, codegen)
/plugin install specforge-backend-rust-axum
/plugin install specforge-db-sqlite
/plugin install specforge-generate-rust-sql
# Optional: frontend plugin
/plugin install specforge-frontend-react-tanstack

# 4. Review OpenAPI spec
# Edit spec/openapi.yaml with your API design

# 5. Generate implementation plan for a given feature
/specforge:plan

# 6. Build everything
/specforge:build

# 7. Validate and test
/specforge:validate
/specforge:test

# 8. Run locally
docker-compose up -d

# 9. Ship it!
/specforge:ship
```

## Conclusion

SpecForge represents a new paradigm in API development:

1. **Schema-First, DB-First**: Both OpenAPI AND database schemas drive development
2. **Type-Safe End-to-End**: Compile-time verification from database to API response
3. **Three-Plugin Architecture**: Clear separation (backend patterns, DB tooling, codegen pipeline)
4. **Test-Driven Iteration**: Agents observe behavior, diagnose issues, and iterate until tests pass
5. **Truly Modular**: Mix any backend + database + codegen plugin
6. **AI-Orchestrated**: Intelligent planning, code generation, and smart implementation
7. **Community-Powered**: Anyone can contribute stack plugins
8. **Production-Ready**: Built-in testing, validation, deployment

**From dual specs (OpenAPI + DB schema) to production in <15 minutes, with compile-time type safety.**

---

**Core Plugin**: `specforge`
**Ecosystem**: `specforge-*` modular plugins
**License**: MIT
**Maintainer**: [TBD]
**Repository**: [TBD]

---

_End of SpecForge Multi-Plugin Architecture Specification_
````
`````
