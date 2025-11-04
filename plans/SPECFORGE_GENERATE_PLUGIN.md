# SpecForge Codegen Pipeline Plugin Implementation Guide

**Target Audience**: Expert Claude Code plugin developers
**Purpose**: Build code generation pipeline plugins that transform database schemas into type-safe, compile-time verified database access code

**Mental Model**: You're creating a **database codegen expert team member** who knows how to run sql-gen/Prisma/sqlc/SQLAlchemy, configure the tooling, generate type-safe query functions, diagnose compilation errors, and optimize generated code.

---

## Table of Contents

1. [Plugin Philosophy & Responsibilities](#plugin-philosophy--responsibilities)
2. [The Code Generation Pipeline](#the-code-generation-pipeline)
3. [Plugin Structure & Manifest](#plugin-structure--manifest)
4. [Required Skills (Knowledge Domains)](#required-skills-knowledge-domains)
5. [Required Agents (Executable Workflows)](#required-agents-executable-workflows)
6. [Integration with SpecForge Core](#integration-with-specforge-core)
7. [Tool-Specific Examples](#tool-specific-examples)
8. [Reference Implementation: Rust + sql-gen](#reference-implementation-rust--sql-gen)

---

## Plugin Philosophy & Responsibilities

### What is a Codegen Pipeline Plugin?

A codegen pipeline plugin makes Claude Code an **expert in a specific database code generation tool** (sql-gen, Prisma, sqlc, SQLAlchemy, etc.) that bridges the gap between database schemas and type-safe application code.

**Critical Understanding**: This plugin does NOT design schemas (database plugin does that). It takes existing database schemas and generates type-safe code from them.

```
Database Schema (migrations/001_users.sql)
  ↓
Codegen Tool (sql-gen, Prisma, sqlc, etc.)
  ↓
Generated Code
  ├─ Type-safe models (User struct/class)
  ├─ Type-safe query functions (create_user, get_user_by_id)
  └─ Query builders (if applicable)
```

### What This Plugin Teaches

The codegen plugin teaches Claude how to:
- **Configure the tool**: Set up sql-gen.toml, schema.prisma, sqlc.yaml, etc.
- **Run code generation**: Execute the tool to generate code from schemas
- **Use generated code**: How to import and use generated types/functions
- **Diagnose errors**: Fix compilation errors in generated code
- **Optimize generated code**: Performance tuning, query optimization
- **Build integration**: Integrate codegen into build process (build.rs, package.json scripts)
- **Type mappings**: Understand SQL → Language type mappings

### Scope of Responsibility

✅ **Codegen Plugin DOES**:
- Configure codegen tool (sql-gen, Prisma, sqlc, etc.)
- Generate type-safe database access code from schemas
- Provide guidance on using generated code
- Diagnose and fix compilation errors in generated code
- Optimize generated queries (if this is possible)
- Integrate codegen into build pipeline
- Document SQL → Language type mappings

❌ **Codegen Plugin DOES NOT**:
- Design database schemas (database plugin does this)
- Implement business logic (backend plugin does this)
- Implement HTTP handlers (backend plugin does this)

### Relationship with Other Plugins

```
┌─────────────────────────────────────┐
│  Backend Plugin (rust-axum)         │
│  - Implements handlers               │
│  - Uses generated query functions    │
└─────────────────────────────────────┘
              ↓ imports
┌─────────────────────────────────────┐
│  Codegen Plugin (rust-sql)          │  ← YOU ARE HERE
│  - Configures sql-gen                │
│  - Generates query functions         │
│  - Generates models                  │
└─────────────────────────────────────┘
              ↓ reads
┌─────────────────────────────────────┐
│  Database Plugin (postgresql)       │
│  - Designs schema                    │
│  - Creates migrations                │
└─────────────────────────────────────┘
```

---

## The Code Generation Pipeline

```
┌─────────────────────────────────────────────────────┐
│ 1. Database Schema (migrations/*.sql)               │
│    CREATE TABLE users (                             │
│      id BIGSERIAL PRIMARY KEY,                      │
│      email VARCHAR(255) NOT NULL,                   │
│      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  │
│    );                                               │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 2. Codegen Tool Configuration                      │
│    - sql-gen.toml (Rust)                           │
│    - schema.prisma (TypeScript)                    │
│    - sqlc.yaml (Go)                                │
│    - alembic.ini (Python)                          │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 3. Code Generation (Codegen Plugin runs tool)      │
│    $ sql-gen generate                               │
│    $ prisma generate                                │
│    $ sqlc generate                                  │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 4. Generated Code                                   │
│    backend/src/generated/db/                        │
│    ├── models.rs (User struct)                      │
│    └── queries.rs (create_user fn, get_user fn)    │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 5. Backend Uses Generated Code                     │
│    use crate::generated::db::{create_user, User};   │
│    let user = create_user(&db, email, name).await?; │
└─────────────────────────────────────────────────────┘
```

---

## Plugin Structure & Manifest

### Directory Structure

```
specforge-generate-{tech}-{database}/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── {tool}-expert.md                    # Tool-specific expertise (sql-gen, Prisma)
│   ├── {tech}-{db}-codegen.md              # Code generation patterns
│   ├── {tech}-{db}-type-mapping.md         # SQL → Language type mapping
│   ├── {tech}-{db}-query-patterns.md       # Query patterns and optimization
│   ├── {tech}-{db}-diagnostics.md          # Diagnosing codegen errors
│   └── {tech}-{db}-dev-setup.md            # Setup ⭐ REQUIRED
├── agents/
│   ├── codegen-executor.md                 # Runs code generation
│   ├── config-generator.md                 # Generates tool config
│   └── diagnostics-agent.md                # Diagnoses errors
├── templates/
│   ├── config.template                     # Tool config template
│   └── build-integration.template          # Build script template
├── examples/
│   ├── simple-crud/
│   └── complex-queries/
├── CODEOWNERS
├── README.md
└── LICENSE
```

### Naming Convention

```
specforge-generate-{technology}-{database-type}
```

Examples:
- `specforge-generate-rust-sql` (Rust with SQL databases - PostgreSQL, MySQL, SQLite)
- `specforge-generate-ts-prisma` (TypeScript with Prisma ORM)
- `specforge-generate-go-sqlc` (Go with sqlc)
- `specforge-generate-python-sqlalchemy` (Python with SQLAlchemy)

### plugin.json Manifest

```json
{
  "name": "specforge-generate-rust-sql",
  "version": "1.0.0",
  "description": "Type-safe Rust SQL code generation using sql-gen - generates query functions and models from database schemas",
  "author": {
    "name": "Your Name"
  },
  "license": "MIT",
  "keywords": [
    "specforge",
    "codegen",
    "rust",
    "sql",
    "sql-gen",
    "type-safety"
  ],
  "skills": [
    "./skills/sql-gen-expert.md",
    "./skills/rust-sql-codegen.md",
    "./skills/rust-sql-type-mapping.md",
    "./skills/rust-sql-query-patterns.md",
    "./skills/rust-sql-diagnostics.md",
    "./skills/rust-sql-dev-setup.md"
  ],
  "agents": [
    "./agents/codegen-executor.md",
    "./agents/config-generator.md",
    "./agents/diagnostics-agent.md"
  ]
}
```

---

## Required Skills (Knowledge Domains)

### 1. Tool Expert Skill ⭐ REQUIRED

**File**: `skills/{tool}-expert.md`

**Purpose**: Deep expertise in the code generation tool

**Example**: `skills/sql-gen-expert.md`

```markdown
---
name: sql-gen-expert
description: Deep expertise in sql-gen - Rust SQL code generation tool
keywords: [sql-gen, rust, codegen, sql, type-safety]
---

# sql-gen Expert

sql-gen is a tool for generating type-safe Rust code from SQL schemas.

## Resources

- **Crate**: https://crates.io/crates/sql-gen
- **Docs**: https://docs.rs/sql-gen/latest/sql_gen/
- **GitHub**: https://github.com/jayson-lennon/sql-gen

## Installation

```toml
# Cargo.toml
[dependencies]
sqlx = { version = "0.7", features = ["runtime-tokio", "sqlite", "macros"] }

[build-dependencies]
sql-gen = "0.4"
```

## Configuration

**sql-gen.toml**:

```toml
[sql-gen]
# Directory containing SQL migrations
schema_dir = "migrations"

# Output directory for generated Rust code
output_dir = "src/generated/db"

# Database URL for introspection (optional)
database_url = "sqlite://dev.db"

[sql-gen.settings]
# Async runtime (tokio or async-std)
async_runtime = "tokio"

# Type overrides (SQL type → Rust type)
[sql-gen.settings.type_overrides]
TIMESTAMP = "chrono::DateTime<Utc>"
TIMESTAMPTZ = "chrono::DateTime<Utc>"
```

## Code Generation Process

### 1. Run Generator

```bash
# Via cargo
cargo build  # Runs build.rs which calls sql-gen

# Or directly
sql-gen generate --config sql-gen.toml
```

### 2. Generated Structure

```
src/generated/db/
├── mod.rs              # Module exports
├── models.rs           # Rust structs for DB tables
└── queries.rs          # Type-safe query functions
```

### 3. Generated Models

From this SQL:

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Generates this Rust:

```rust
// src/generated/db/models.rs

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct User {
    pub id: i64,
    pub email: String,
    pub name: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}
```

### 4. Generated Query Functions

```rust
// src/generated/db/queries.rs

use sqlx::SqlitePool;
use super::models::User;

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

pub async fn get_user_by_id(
    pool: &SqlitePool,
    id: i64,
) -> Result<Option<User>, sqlx::Error> {
    sqlx::query_as!(
        User,
        r#"
        SELECT id, email, name, created_at
        FROM users
        WHERE id = ?
        "#,
        id
    )
    .fetch_optional(pool)
    .await
}

pub async fn list_users(
    pool: &SqlitePool,
    limit: i64,
    offset: i64,
) -> Result<Vec<User>, sqlx::Error> {
    sqlx::query_as!(
        User,
        r#"
        SELECT id, email, name, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
        "#,
        limit,
        offset
    )
    .fetch_all(pool)
    .await
}
```

## Type Mappings

| SQL Type | Rust Type |
|----------|-----------|
| `BIGINT`, `BIGSERIAL` | `i64` |
| `INTEGER`, `SERIAL` | `i32` |
| `SMALLINT` | `i16` |
| `VARCHAR(n)`, `TEXT` | `String` |
| `BOOLEAN` | `bool` |
| `TIMESTAMP`, `TIMESTAMPTZ` | `chrono::DateTime<Utc>` |
| `DATE` | `chrono::NaiveDate` |
| `JSONB` | `serde_json::Value` |
| Nullable column | `Option<T>` |

## Build Integration

**build.rs**:

```rust
fn main() {
    // Trigger rebuild if migrations change
    println!("cargo:rerun-if-changed=migrations/");
    println!("cargo:rerun-if-changed=sql-gen.toml");

    // Run sql-gen
    sql_gen::generate("sql-gen.toml").expect("Failed to generate code");
}
```

## Compile-Time Verification

sql-gen uses `sqlx::query_as!` macro which verifies queries at compile time:

```rust
// This will fail to compile if:
// - Table doesn't exist
// - Column types don't match
// - Query is malformed
let user = sqlx::query_as!(
    User,
    "SELECT * FROM users WHERE id = ?",
    id
)
.fetch_one(pool)
.await?;
```

## Best Practices

1. **Run codegen before build**: Use `build.rs` to ensure generated code is always fresh
2. **Don't edit generated code**: Regenerate instead
3. **Use type overrides**: For custom types like `chrono::DateTime`
4. **Leverage compile-time checking**: Let the compiler catch SQL errors
5. **Keep migrations clean**: Generated code quality depends on schema quality

### 2. Code Generation Skill ⭐ REQUIRED

**File**: `skills/{tech}-{db}-codegen.md`

**Purpose**: Code generation patterns and best practices

### 3. Type Mapping Skill ⭐ REQUIRED

**File**: `skills/{tech}-{db}-type-mapping.md`

**Purpose**: How SQL types map to language types

**Example**: `skills/rust-sql-type-mapping.md`

```markdown
---
name: rust-sql-type-mapping
description: SQL to Rust type mappings for type-safe database code
keywords: [rust, sql, types, mapping, sqlx]
---

# SQL to Rust Type Mapping

How SQL types map to Rust types in generated code.

## Numeric Types

| SQL Type | Rust Type | Notes |
|----------|-----------|-------|
| `SMALLINT` | `i16` | -32,768 to 32,767 |
| `INTEGER`, `SERIAL` | `i32` | -2 billion to 2 billion |
| `BIGINT`, `BIGSERIAL` | `i64` | -9 quintillion to 9 quintillion |
| `REAL` | `f32` | Single precision float |
| `DOUBLE PRECISION` | `f64` | Double precision float |
| `NUMERIC`, `DECIMAL` | `rust_decimal::Decimal` | Exact decimal |

## String Types

| SQL Type | Rust Type | Notes |
|----------|-----------|-------|
| `VARCHAR(n)` | `String` | Variable length, max n chars |
| `CHAR(n)` | `String` | Fixed length, padded |
| `TEXT` | `String` | Unlimited length |

## Boolean

| SQL Type | Rust Type |
|----------|-----------|
| `BOOLEAN` | `bool` |

## Date/Time Types

| SQL Type | Rust Type | Cargo Feature |
|----------|-----------|---------------|
| `DATE` | `chrono::NaiveDate` | `sqlx/chrono` |
| `TIME` | `chrono::NaiveTime` | `sqlx/chrono` |
| `TIMESTAMP` | `chrono::NaiveDateTime` | `sqlx/chrono` |
| `TIMESTAMPTZ` | `chrono::DateTime<Utc>` | `sqlx/chrono` |

**Recommendation**: Always use `TIMESTAMPTZ` in SQL to get `DateTime<Utc>` in Rust.

## JSON Types

| SQL Type | Rust Type | Cargo Feature |
|----------|-----------|---------------|
| `JSON`, `JSONB` | `serde_json::Value` | `sqlx/json` |

Or use custom types:

```rust
#[derive(Serialize, Deserialize, sqlx::Type)]
#[sqlx(transparent)]
struct UserMetadata {
    preferences: HashMap<String, String>,
}
```

## Array Types

| SQL Type | Rust Type |
|----------|-----------|
| `INTEGER[]` | `Vec<i32>` |
| `TEXT[]` | `Vec<String>` |
| `BOOLEAN[]` | `Vec<bool>` |

## UUID

| SQL Type | Rust Type | Cargo Feature |
|----------|-----------|---------------|
| `UUID` | `uuid::Uuid` | `sqlx/uuid` |

## NULL Handling

| SQL | Rust |
|-----|------|
| `NOT NULL` | `T` |
| Nullable | `Option<T>` |

```sql
CREATE TABLE users (
    id BIGINT NOT NULL,        -- i64
    email VARCHAR(255) NOT NULL,  -- String
    name VARCHAR(255),         -- Option<String>
);
```

```rust
struct User {
    id: i64,
    email: String,
    name: Option<String>,
}
```

## Custom Type Overrides

In `sql-gen.toml`:

```toml
[sql-gen.settings.type_overrides]
# Override specific SQL types
TIMESTAMP = "chrono::DateTime<Utc>"
user_id = "UserId"  # Custom newtype

# For JSONB columns
metadata = "UserMetadata"
```

Then define custom type:

```rust
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(transparent)]
pub struct UserId(i64);

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "jsonb", transparent)]
pub struct UserMetadata {
    pub preferences: HashMap<String, String>,
}
```

### 4. Query Patterns Skill

**File**: `skills/{tech}-{db}-query-patterns.md`

**Purpose**: Common query patterns and optimization

### 5. Diagnostics Skill ⭐ REQUIRED

**File**: `skills/{tech}-{db}-diagnostics.md`

**Purpose**: Diagnosing and fixing code generation errors

**Example**: `skills/rust-sql-diagnostics.md`

```markdown
---
name: rust-sql-diagnostics
description: Diagnose and fix Rust SQL code generation errors
keywords: [rust, sql, diagnostics, errors, debugging]
---

# Rust SQL Diagnostics

Common code generation errors and how to fix them.

## Compilation Errors

### Error: Type Mismatch

```
error[E0308]: mismatched types
  --> src/generated/db/queries.rs:12:5
   |
12 |     pub created_at: String,
   |                     ^^^^^^ expected `DateTime<Utc>`, found `String`
```

**Cause**: SQL type mapped incorrectly to Rust type.

**Fix**: Add type override in `sql-gen.toml`:

```toml
[sql-gen.settings.type_overrides]
TIMESTAMP = "chrono::DateTime<Utc>"
```

### Error: Column Not Found

```
error: column `users.deleted_at` not found in table
```

**Cause**: Query references column that doesn't exist in schema.

**Fix**:
1. Check migrations - is column actually created?
2. Regenerate code after migration: `cargo clean && cargo build`
3. Verify migration was applied to database

### Error: Cannot Find Type

```
error[E0433]: failed to resolve: use of undeclared type `DateTime`
   |
   | pub created_at: DateTime<Utc>,
   |                 ^^^^^^^^ not found in this scope
```

**Cause**: Missing dependency.

**Fix**: Add to `Cargo.toml`:

```toml
[dependencies]
chrono = { version = "0.4", features = ["serde"] }
sqlx = { version = "0.7", features = ["chrono"] }
```

## Runtime Errors

### Error: Database Locked (SQLite)

```
Error: error returned from database: database is locked
```

**Cause**: Multiple connections trying to write simultaneously.

**Fix**: Use WAL mode in SQLite:

```sql
PRAGMA journal_mode = WAL;
```

### Error: Connection Pool Exhausted

```
Error: timed out while waiting for an open connection
```

**Cause**: Too many concurrent queries, pool size too small.

**Fix**: Increase pool size:

```rust
let pool = SqlitePool::connect_with(
    SqliteConnectOptions::from_str(&database_url)?
        .max_connections(20)  // Increase from default 10
).await?;
```

## Query Performance Issues

### Problem: Slow Queries

Use `EXPLAIN QUERY PLAN`:

```sql
EXPLAIN QUERY PLAN
SELECT * FROM users WHERE email = 'test@example.com';
```

Look for "SCAN TABLE" (bad) vs "SEARCH TABLE USING INDEX" (good).

**Fix**: Add index:

```sql
CREATE INDEX idx_users_email ON users(email);
```

Then regenerate code.

### Problem: N+1 Queries

```rust
// ✗ Bad: N+1 problem
for user in users {
    let orders = get_orders_by_user_id(&pool, user.id).await?;
}

// ✓ Good: Single query with JOIN
let users_with_orders = get_users_with_orders(&pool).await?;
```

**Fix**: Add compound query function to generated code (or custom query).

## Debugging Tips

1. **Check generated code**: Look at `src/generated/db/queries.rs`
2. **Enable query logging**:
   ```rust
   std::env::set_var("RUST_LOG", "sqlx=debug");
   ```
3. **Test queries manually**: Run SQL in database client first
4. **Clean and rebuild**: `cargo clean && cargo build`
5. **Verify migrations applied**: Check `schema_migrations` table

### 6. Dev Setup Skill ⭐ REQUIRED

**File**: `skills/{tech}-{db}-dev-setup.md`

**Purpose**: How to integrate codegen into development workflow

---

## Required Agents (Executable Workflows)

### 1. Codegen Executor Agent ⭐ REQUIRED

**File**: `agents/codegen-executor.md`

**Model**: Haiku

**Purpose**: Run code generation tool

**Input**:

```json
{
  "task": "generate-code",
  "schema_dir": "migrations/",
  "output_dir": "backend/src/generated/db",
  "config_path": "sql-gen.toml",
  "database_url": "sqlite://dev.db"
}
```

**Output**:

```json
{
  "status": "completed",
  "files_generated": [
    "backend/src/generated/db/mod.rs",
    "backend/src/generated/db/models.rs",
    "backend/src/generated/db/queries.rs"
  ],
  "models_count": 5,
  "queries_count": 15,
  "warnings": []
}
```

### 2. Config Generator Agent ⭐ REQUIRED

**File**: `agents/config-generator.md`

**Model**: Haiku

**Purpose**: Generate tool configuration file

**Input**:

```json
{
  "task": "generate-config",
  "database": "sqlite",
  "schema_dir": "migrations/",
  "output_dir": "src/generated/db",
  "database_url": "sqlite://dev.db"
}
```

**Output**:

```toml
[sql-gen]
schema_dir = "migrations"
output_dir = "src/generated/db"
database_url = "sqlite://dev.db"

[sql-gen.settings]
async_runtime = "tokio"

[sql-gen.settings.type_overrides]
TIMESTAMP = "chrono::DateTime<Utc>"
TIMESTAMPTZ = "chrono::DateTime<Utc>"
```

### 3. Diagnostics Agent ⭐ REQUIRED

**File**: `agents/diagnostics-agent.md`

**Model**: Sonnet (diagnostics require reasoning)

**Purpose**: Diagnose and fix code generation errors

**Input**:

```json
{
  "task": "diagnose-errors",
  "compilation_errors": [
    {
      "file": "src/generated/db/queries.rs",
      "line": 12,
      "error": "mismatched types: expected `DateTime<Utc>`, found `String`",
      "code": "E0308"
    }
  ],
  "generated_code_path": "src/generated/db",
  "config_path": "sql-gen.toml"
}
```

**Output**:

```json
{
  "status": "completed",
  "diagnosis": "SQL TIMESTAMP type is being mapped to String instead of DateTime<Utc>",
  "fixes": [
    {
      "type": "config_change",
      "file": "sql-gen.toml",
      "change": "Add type override: TIMESTAMP = \"chrono::DateTime<Utc>\"",
      "patch": "..."
    },
    {
      "type": "dependency_add",
      "file": "Cargo.toml",
      "change": "Add chrono dependency with serde feature",
      "patch": "..."
    }
  ],
  "regenerate_required": true
}
```

---

## Integration with SpecForge Core

```javascript
// SpecForge /specforge:build - Codegen phase

// Phase 1: Database migrations applied (database plugin)

// Phase 2: Code Generation

// 2a. Generate codegen tool config
await invokeAgent('specforge-generate-rust-sql/config-generator', {
  task: 'generate-config',
  database: 'sqlite',
  schema_dir: 'migrations/',
  output_dir: 'backend/src/generated/db'
});

// 2b. Run code generation
const codegenResult = await invokeAgent('specforge-generate-rust-sql/codegen-executor', {
  task: 'generate-code',
  schema_dir: 'migrations/',
  output_dir: 'backend/src/generated/db',
  config_path: 'sql-gen.toml'
});

// 2c. Try to compile
const compileResult = await compileBa ckend('backend/');

// 2d. If errors, diagnose and fix
if (compileResult.errors.length > 0) {
  const diagnosis = await invokeAgent('specforge-generate-rust-sql/diagnostics-agent', {
    task: 'diagnose-errors',
    compilation_errors: compileResult.errors,
    generated_code_path: 'backend/src/generated/db'
  });

  // Apply fixes
  await applyFixes(diagnosis.fixes);

  // Regenerate if needed
  if (diagnosis.regenerate_required) {
    await invokeAgent('specforge-generate-rust-sql/codegen-executor', {
      task: 'generate-code',
      schema_dir: 'migrations/',
      output_dir: 'backend/src/generated/db'
    });
  }
}

// Phase 3: Handler implementation (backend plugin uses generated code)
```

---

## Tool-Specific Examples

### Rust + sql-gen

**Tool**: sql-gen
**Output**: Type-safe Rust structs + query functions
**Runtime**: SQLx with compile-time verification

### TypeScript + Prisma

**Tool**: Prisma
**Output**: Prisma Client with TypeScript types
**Runtime**: Prisma ORM

### Go + sqlc

**Tool**: sqlc
**Output**: Type-safe Go structs + query functions
**Runtime**: database/sql

### Python + SQLAlchemy

**Tool**: SQLAlchemy + Alembic
**Output**: ORM models
**Runtime**: SQLAlchemy

---

## Reference Implementation: Rust + sql-gen

### Generated Code Example

**Input Schema** (`migrations/001_users.sql`):

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

**Generated Models** (`src/generated/db/models.rs`):

```rust
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct User {
    pub id: i64,
    pub email: String,
    pub name: Option<String>,
    pub created_at: DateTime<Utc>,
}
```

**Generated Queries** (`src/generated/db/queries.rs`):

```rust
use sqlx::SqlitePool;
use super::models::User;
use chrono::{DateTime, Utc};

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
        RETURNING id, email, name, created_at as "created_at: DateTime<Utc>"
        "#,
        email,
        name
    )
    .fetch_one(pool)
    .await
}

pub async fn get_user_by_id(
    pool: &SqlitePool,
    id: i64,
) -> Result<Option<User>, sqlx::Error> {
    sqlx::query_as!(
        User,
        r#"
        SELECT id, email, name, created_at as "created_at: DateTime<Utc>"
        FROM users
        WHERE id = ?
        "#,
        id
    )
    .fetch_optional(pool)
    .await
}

pub async fn get_user_by_email(
    pool: &SqlitePool,
    email: &str,
) -> Result<Option<User>, sqlx::Error> {
    sqlx::query_as!(
        User,
        r#"
        SELECT id, email, name, created_at as "created_at: DateTime<Utc>"
        FROM users
        WHERE email = ?
        "#,
        email
    )
    .fetch_optional(pool)
    .await
}

pub async fn list_users(
    pool: &SqlitePool,
    limit: i64,
    offset: i64,
) -> Result<Vec<User>, sqlx::Error> {
    sqlx::query_as!(
        User,
        r#"
        SELECT id, email, name, created_at as "created_at: DateTime<Utc>"
        FROM users
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
        "#,
        limit,
        offset
    )
    .fetch_all(pool)
    .await
}

pub async fn delete_user(
    pool: &SqlitePool,
    id: i64,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "DELETE FROM users WHERE id = ?",
        id
    )
    .execute(pool)
    .await?;

    Ok(())
}
```

**Module Export** (`src/generated/db/mod.rs`):

```rust
pub mod models;
pub mod queries;

pub use models::*;
pub use queries::*;
```

---

## Best Practices Summary

1. **Schema-First**: Database schema is source of truth
2. **Compile-Time Safety**: Leverage language type system
3. **Don't Edit Generated Code**: Regenerate instead
4. **Type Overrides**: For custom types (DateTime, NewTypes, etc.)
5. **Build Integration**: Auto-regenerate on schema changes
6. **Diagnostics**: Clear error messages and fixes
7. **Query Optimization**: Generate efficient queries
8. **Documentation**: Comment generated code

---

## Quick Start Checklist

- [ ] Choose technology + tool (rust-sql, ts-prisma, go-sqlc, python-sqlalchemy)
- [ ] Understand tool's code generation process
- [ ] Create `plugin.json` with `specforge` metadata
- [ ] Create required skills:
  - [ ] `{tool}-expert.md` - Tool-specific expertise
  - [ ] `{tech}-{db}-codegen.md` - Code generation patterns
  - [ ] `{tech}-{db}-type-mapping.md` - Type mappings
  - [ ] `{tech}-{db}-query-patterns.md` - Query optimization (optional)
  - [ ] `{tech}-{db}-diagnostics.md` - Error diagnostics
  - [ ] `{tech}-{db}-dev-setup.md` - Dev setup ⭐
- [ ] Create required agents:
  - [ ] `codegen-executor.md` - Runs code generation
  - [ ] `config-generator.md` - Generates tool config
  - [ ] `diagnostics-agent.md` - Diagnoses errors
- [ ] Create config templates
- [ ] Add complete examples
- [ ] Test with compatible database/backend plugins
- [ ] Submit with `/plugin-builder:publish`

---

**End of Codegen Pipeline Plugin Implementation Guide**