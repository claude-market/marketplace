# SpecForge Database Plugin Implementation Guide

**Target Audience**: Expert Claude Code plugin developers
**Purpose**: Build database expertise plugins that make Claude Code an expert in a specific database technology

**Mental Model**: You're creating a **database expert team member** who brings deep knowledge of PostgreSQL/MySQL/SQLite/MongoDB and can guide schema design, plan migrations, optimize queries, and set up local development environments.

---

## Table of Contents

1. [Plugin Philosophy & Responsibilities](#plugin-philosophy--responsibilities)
2. [Plugin Structure & Manifest](#plugin-structure--manifest)
3. [Required Skills (Knowledge Domains)](#required-skills-knowledge-domains)
4. [Required Agents (Executable Workflows)](#required-agents-executable-workflows)
5. [Integration with SpecForge Core](#integration-with-specforge-core)
6. [Database-Specific Expertise Examples](#database-specific-expertise-examples)
7. [Reference Implementation: PostgreSQL](#reference-implementation-postgresql)

---

## Plugin Philosophy & Responsibilities

### What is a Database Plugin?

A database plugin makes Claude Code an **expert in a specific database technology**. Think of it as hiring a senior database engineer who knows:

- **Schema Design**: Best practices for tables, columns, constraints, relationships
- **Data Types**: When to use VARCHAR vs TEXT, INTEGER vs BIGINT, JSONB vs separate tables
- **Indexing**: B-tree vs GIN vs GIST, covering indexes, partial indexes
- **Migrations**: How to safely evolve schemas without downtime
- **Query Optimization**: Analyzing EXPLAIN plans, rewriting queries
- **Database Features**: Database-specific capabilities (PostgreSQL JSONB, MySQL JSON, SQLite FTS5)
- **Local Setup**: Docker Compose configuration, connection strings, environment variables
- **Performance**: Connection pooling, vacuum strategies, replication

### Scope of Responsibility

✅ **Database Plugin DOES**:
- Teach Claude about database-specific features and best practices
- Design schemas based on requirements
- Plan safe schema migrations (e.g., how to add NOT NULL to existing column)
- Recommend optimal data types and constraints
- Guide indexing strategies
- Optimize queries and analyze performance
- Provide Docker Compose setup for local development
- Diagnose database-specific issues

❌ **Database Plugin DOES NOT**:
- Generate application code (that's the codegen plugin's job)
- Implement business logic (that's the backend plugin's job)
- Manage ORM configuration beyond schema (shared with codegen plugin)

### Relationship with Other Plugins

```
┌─────────────────────────────────────┐
│  Backend Plugin (rust-axum)         │
│  - Implements handlers               │
│  - Business logic                    │
└─────────────────────────────────────┘
              ↓ uses
┌─────────────────────────────────────┐
│  Codegen Plugin (rust-sql)          │
│  - Generates type-safe DB access     │
│  - Runs sql-gen/Prisma/sqlc         │
└─────────────────────────────────────┘
              ↓ reads schema from
┌─────────────────────────────────────┐
│  Database Plugin (postgresql)       │
│  - Designs schema                    │
│  - Plans migrations                  │
│  - Provides DB expertise             │
└─────────────────────────────────────┘
```

---

## Plugin Structure & Manifest

### Directory Structure

```
specforge-db-{database}/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── {db}-expert.md              # Core database knowledge
│   ├── {db}-schema-design.md       # Schema design patterns
│   ├── {db}-migrations.md          # Migration best practices
│   ├── {db}-performance.md         # Query optimization, indexing
│   └── {db}-dev-setup.md           # Docker Compose setup ⭐ REQUIRED
├── agents/
│   ├── schema-designer.md          # Designs schemas from requirements
│   ├── migration-planner.md        # Plans schema migrations
│   ├── query-optimizer.md          # Optimizes queries
│   └── migration-executor.md       # Applies migrations (optional)
├── examples/
│   ├── e-commerce-schema/
│   └── saas-app-schema/
├── CODEOWNERS
├── README.md
└── LICENSE
```

### Naming Convention

```
specforge-db-{database}
```

Examples:
- `specforge-db-postgresql`
- `specforge-db-mysql`
- `specforge-db-sqlite`
- `specforge-db-mongodb`

### plugin.json Manifest

```json
{
  "name": "specforge-db-postgresql",
  "version": "1.0.0",
  "description": "PostgreSQL database expertise for SpecForge - schema design, migrations, query optimization",
  "author": {
    "name": "Your Name",
    "email": "contact@example.com"
  },
  "license": "MIT",
  "keywords": [
    "specforge",
    "database",
    "postgresql",
    "schema-design",
    "migrations"
  ],
  "skills": [
    "./skills/postgresql-expert.md",
    "./skills/postgresql-schema-design.md",
    "./skills/postgresql-migrations.md",
    "./skills/postgresql-performance.md",
    "./skills/postgresql-dev-setup.md"
  ],
  "agents": [
    "./agents/schema-designer.md",
    "./agents/migration-planner.md",
    "./agents/query-optimizer.md"
  ]
}
```

## Required Skills (Knowledge Domains)

Skills teach Claude Code what to know. Each skill is a focused knowledge domain.

### 1. Core Database Expert Skill ⭐ REQUIRED

**File**: `skills/{db}-expert.md`

**Purpose**: Core database knowledge - features, data types, constraints, best practices

**Example**: `skills/postgresql-expert.md`

```markdown
---
name: postgresql-expert
description: Deep expertise in PostgreSQL features, data types, constraints, and best practices
keywords: [postgresql, database, sql, data-types]
---

# PostgreSQL Expert

Core PostgreSQL knowledge for schema design and database operations.

## PostgreSQL-Specific Features

### JSONB (Binary JSON Storage)

When to use JSONB:
- Semi-structured data with varying schemas
- Nested objects that don't need relational integrity
- API responses or event data

```sql
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for JSONB queries
CREATE INDEX idx_events_payload_gin ON events USING GIN(payload);

-- Query JSONB
SELECT * FROM events WHERE payload->>'user_id' = '123';
SELECT * FROM events WHERE payload @> '{"action": "login"}'::jsonb;
```

When NOT to use JSONB:
- Data with strict schema that benefits from normalization
- Frequent JOINs with other tables
- Need foreign key constraints

### Array Types

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    permissions VARCHAR(50)[] DEFAULT '{}'
);

-- Array queries
SELECT * FROM users WHERE 'admin' = ANY(permissions);
SELECT * FROM users WHERE tags && ARRAY['premium', 'verified'];

-- Index for array containment queries
CREATE INDEX idx_users_tags_gin ON users USING GIN(tags);
```

### Generated Columns (PostgreSQL 12+)

```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    price_cents INTEGER NOT NULL,
    tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0875,

    -- Generated column (always computed)
    price_with_tax_cents INTEGER GENERATED ALWAYS AS
        (price_cents + CAST(price_cents * tax_rate AS INTEGER)) STORED
);
```

### Full-Text Search

```sql
CREATE TABLE articles (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    search_vector tsvector GENERATED ALWAYS AS
        (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))) STORED
);

CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);

-- Full-text search query
SELECT * FROM articles
WHERE search_vector @@ to_tsquery('english', 'postgresql & performance');
```

## Data Type Selection

### Integers

```sql
-- Use appropriate integer size
user_id BIGINT             -- 8 bytes, -9 quintillion to +9 quintillion
count INTEGER              -- 4 bytes, -2 billion to +2 billion
flags SMALLINT             -- 2 bytes, -32K to +32K
status SMALLINT            -- For enums with few values

-- AUTO INCREMENT
id BIGSERIAL PRIMARY KEY   -- Preferred for new tables
id SERIAL PRIMARY KEY      -- For smaller tables
```

### Strings

```sql
-- Always use VARCHAR with explicit limit (better performance, prevents abuse)
email VARCHAR(255) NOT NULL
username VARCHAR(50) NOT NULL
status VARCHAR(20) NOT NULL

-- TEXT only when truly unbounded
description TEXT
blog_content TEXT

-- CHAR(n) rarely useful (fixed-length, space-padded)
country_code CHAR(2)  -- 'US', 'GB'
```

### Decimals vs Integers for Money

```sql
-- ✓ RECOMMENDED: Store as cents (integers)
price_cents INTEGER NOT NULL CHECK (price_cents >= 0)
-- Pros: No rounding errors, exact arithmetic, faster
-- Cons: Application must handle cent conversion

-- Alternative: NUMERIC for exact decimal
price NUMERIC(10, 2) NOT NULL CHECK (price >= 0)
-- Pros: Decimal in DB, clearer intent
-- Cons: Slower, still need application logic for display

-- ✗ NEVER use FLOAT/REAL for money
price FLOAT  -- NO! Precision errors!
```

### Timestamps

```sql
-- ✓ ALWAYS use TIMESTAMPTZ (timestamp with timezone)
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

-- ✗ NEVER use TIMESTAMP (without timezone)
created_at TIMESTAMP  -- Ambiguous! What timezone?
```

### Booleans

```sql
-- Use BOOLEAN for true/false flags
is_active BOOLEAN NOT NULL DEFAULT true
email_verified BOOLEAN NOT NULL DEFAULT false

-- Use CHECK constraints for tri-state
status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'pending'))
```

### UUIDs

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- UUID primary keys (good for distributed systems, merges)
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()

-- Or use gen_random_uuid() (PostgreSQL 13+)
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

## Constraints

### Primary Keys

```sql
-- Always explicit PK
id BIGSERIAL PRIMARY KEY

-- Composite PKs for junction tables
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
```

### Foreign Keys

```sql
-- Standard FK with CASCADE delete
user_id BIGINT NOT NULL,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

-- RESTRICT prevents deletion if references exist
category_id BIGINT NOT NULL,
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT

-- SET NULL on deletion
assigned_user_id BIGINT,
FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL
```

### CHECK Constraints

```sql
-- Validate data at database level
price_cents INTEGER NOT NULL CHECK (price_cents >= 0)
quantity INTEGER NOT NULL CHECK (quantity > 0)
email VARCHAR(255) NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}$')
status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'active', 'cancelled'))
```

### UNIQUE Constraints

```sql
-- Single column
email VARCHAR(255) UNIQUE NOT NULL

-- Multiple columns (composite unique)
CONSTRAINT unique_user_product UNIQUE (user_id, product_id)

-- Partial unique (conditional)
CREATE UNIQUE INDEX idx_active_user_emails
ON users(email) WHERE active = true;
```

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [PostgreSQL Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
```

### 2. Schema Design Skill ⭐ REQUIRED

**File**: `skills/{db}-schema-design.md`

**Purpose**: Patterns for designing database schemas - normalization, denormalization, relationships

**Key Topics**:
- Entity-relationship modeling
- Normalization (1NF, 2NF, 3NF) and when to denormalize
- One-to-many, many-to-many relationships
- Junction tables
- Self-referencing tables
- Polymorphic associations
- Schema patterns for common domains (e-commerce, SaaS, etc.)

### 3. Migrations Skill ⭐ REQUIRED

**File**: `skills/{db}-migrations.md`

**Purpose**: Safe schema evolution strategies

**Key Topics**:
- How to add columns (nullable vs with default vs two-step)
- How to remove columns safely
- How to change column types
- How to add NOT NULL constraints to existing columns
- How to rename tables/columns
- How to split tables
- How to merge tables
- Backwards-compatible migrations
- Zero-downtime migration strategies

### 4. Performance/Query Optimization Skill

**File**: `skills/{db}-performance.md`

**Purpose**: Query optimization, indexing strategies, EXPLAIN analysis

**Key Topics**:
- Index types (B-tree, GIN, GIST, Hash)
- When to add indexes
- Covering indexes
- Partial indexes
- Index-only scans
- Query planning and EXPLAIN ANALYZE
- N+1 query problems
- Connection pooling recommendations

### 5. Dev Setup Skill ⭐ REQUIRED

**File**: `skills/{db}-dev-setup.md`

**Purpose**: How to set up this database locally with Docker Compose

**This is CRITICAL**: The core SpecForge setup orchestrator reads ALL `{tech}-dev-setup.md` skills from installed plugins and combines them into a unified setup.

**Structure**:

```markdown
---
name: postgresql-dev-setup
description: Set up PostgreSQL for local development with Docker Compose
keywords: [postgresql, docker, docker-compose, setup, development]
---

# PostgreSQL Development Setup

Docker Compose configuration and environment setup for PostgreSQL.

## Docker Compose Service

Add this service to your `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: ${PROJECT_NAME:-app}-postgres
    restart: unless-stopped

    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-app_dev}

    ports:
      - "${POSTGRES_PORT:-5432}:5432"

    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d:ro

    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-app_dev}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

volumes:
  postgres_data:
    driver: local
```

## Environment Variables

Add to `.env`:

```bash
# PostgreSQL Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=app_dev
POSTGRES_PORT=5432
POSTGRES_HOST=localhost

# Connection String (for application)
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}
```

## Initialization Scripts

Place migration files in `migrations/` directory. They will run on first startup.

## Verify Setup

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Wait for healthy
docker-compose ps postgres

# Test connection
psql postgresql://postgres:postgres@localhost:5432/app_dev -c "SELECT version();"
```

## Connection Pooling Recommendations

- **Development**: 5-10 connections
- **Production**: 10-20 connections per app instance
- **Formula**: `(2 × CPU cores) + effective_spindle_count`

## Common Issues

### Port already in use
```bash
# Find process using port 5432
lsof -i :5432

# Change port in .env
POSTGRES_PORT=5433
```

### Migrations not running
```bash
# Migrations only run on first init
# For subsequent runs, apply manually
psql $DATABASE_URL -f migrations/001_initial.sql
```

---

## Required Agents (Executable Workflows)

Agents are executable workflows that perform specific tasks using the knowledge from skills.

**Key Principle**: Each distinct workflow step = separate agent

### 1. Schema Designer Agent ⭐ REQUIRED

**File**: `agents/schema-designer.md`

**Model**: Sonnet (schema design requires reasoning)

**Purpose**: Design database schemas from requirements

**Input**:
```json
{
  "task": "design-schema",
  "requirements": {
    "entities": ["User", "Post", "Comment"],
    "relationships": [
      {"from": "User", "to": "Post", "type": "one-to-many"},
      {"from": "Post", "to": "Comment", "type": "one-to-many"},
      {"from": "User", "to": "Comment", "type": "one-to-many"}
    ],
    "features": ["full-text search on posts", "user roles", "soft delete"]
  }
}
```

**Output**:
```json
{
  "status": "completed",
  "schema_sql": "CREATE TABLE users (...); CREATE TABLE posts (...); ...",
  "design_decisions": [
    "Used BIGSERIAL for all PKs for scalability",
    "Added tsvector for full-text search on posts.body",
    "Implemented soft delete with deleted_at TIMESTAMPTZ",
    "Created user_roles junction table for many-to-many"
  ],
  "indexes": [
    "idx_posts_user_id",
    "idx_posts_search_vector (GIN)",
    "idx_comments_post_id"
  ]
}
```

### 2. Migration Planner Agent ⭐ REQUIRED

**File**: `agents/migration-planner.md`

**Model**: Sonnet (migration planning requires careful reasoning)

**Purpose**: Plan safe schema migrations from current schema → desired schema

**Input**:
```json
{
  "task": "plan-migration",
  "current_schema": "CREATE TABLE users (id BIGSERIAL PRIMARY KEY, email VARCHAR(255));",
  "desired_changes": [
    "Add phone column to users",
    "Make email case-insensitive unique",
    "Add users.created_at timestamp"
  ]
}
```

**Output**:
```json
{
  "status": "completed",
  "migration_steps": [
    {
      "step": 1,
      "description": "Add phone column (nullable first)",
      "sql": "ALTER TABLE users ADD COLUMN phone VARCHAR(20);",
      "rationale": "Adding nullable column is safe, no data migration needed",
      "rollback_sql": "ALTER TABLE users DROP COLUMN phone;"
    },
    {
      "step": 2,
      "description": "Add created_at with default",
      "sql": "ALTER TABLE users ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();",
      "rationale": "DEFAULT NOW() allows adding NOT NULL to existing rows",
      "rollback_sql": "ALTER TABLE users DROP COLUMN created_at;"
    },
    {
      "step": 3,
      "description": "Create case-insensitive unique index on email",
      "sql": "CREATE UNIQUE INDEX idx_users_email_lower ON users(LOWER(email));",
      "rationale": "Functional index for case-insensitive uniqueness, doesn't lock table",
      "rollback_sql": "DROP INDEX idx_users_email_lower;"
    }
  ],
  "warnings": [
    "Step 3 requires checking for duplicate emails (case-insensitive) before applying"
  ],
  "estimated_downtime": "none (all steps are non-blocking)"
}
```

### 3. Query Optimizer Agent (Optional)

**File**: `agents/query-optimizer.md`

**Model**: Haiku for simple queries, Sonnet for complex

**Purpose**: Analyze and optimize SQL queries

**Input**:
```json
{
  "task": "optimize-query",
  "query": "SELECT u.name, COUNT(p.id) FROM users u LEFT JOIN posts p ON u.id = p.user_id WHERE u.created_at > NOW() - INTERVAL '30 days' GROUP BY u.id, u.name;",
  "explain_plan": "... EXPLAIN ANALYZE output ..."
}
```

**Output**:
```json
{
  "status": "completed",
  "issues": [
    "Sequential scan on users table (no index on created_at)",
    "Hash aggregate taking 45% of query time"
  ],
  "recommendations": [
    {
      "type": "add-index",
      "sql": "CREATE INDEX idx_users_created_at ON users(created_at DESC);",
      "expected_improvement": "Reduce scan from 100K rows to ~5K rows"
    },
    {
      "type": "rewrite-query",
      "optimized_query": "WITH recent_users AS (SELECT id, name FROM users WHERE created_at > NOW() - INTERVAL '30 days') SELECT ru.name, COUNT(p.id) FROM recent_users ru LEFT JOIN posts p ON ru.id = p.user_id GROUP BY ru.id, ru.name;",
      "rationale": "CTE helps planner estimate cardinality better"
    }
  ],
  "estimated_speedup": "3-5x faster"
}
```

### 4. Migration Executor Agent (Optional)

**File**: `agents/migration-executor.md`

**Model**: Haiku (execution is straightforward)

**Purpose**: Apply planned migrations to database

**Note**: This agent executes SQL. Use with caution. Some teams may prefer manual execution.

---

## Integration with SpecForge Core

### How Core Orchestrator Invokes Database Plugin

```javascript
// Core SpecForge /specforge:plan command

// Step 1: User describes feature
// "Add order management to my e-commerce API"
// TODO: this is inaccurate, a previous agent from core would take the business requirements and build a DB-agnostic schema from it. This is to make sure it also matches with the OpenAPI spec
// This schema will then be passed into the schema designer that needs to turn the business models into DB models + relations

// Step 2: Core delegates to database plugin's schema-designer agent
const schemaDesign = await invokeAgent('specforge-db-postgresql/schema-designer', {
  task: 'design-schema',
  requirements: {
    entities: ['Order', 'OrderItem', 'Product'],
    relationships: [
      {from: 'Order', to: 'User', type: 'many-to-one'},
      {from: 'Order', to: 'OrderItem', type: 'one-to-many'},
      {from: 'OrderItem', to: 'Product', type: 'many-to-one'}
    ]
  }
});

// Step 3: Core delegates to migration-planner agent
const migrationPlan = await invokeAgent('specforge-db-postgresql/migration-planner', {
  task: 'plan-migration',
  current_schema: await readCurrentSchema(),
  desired_schema: schemaDesign.schema_sql
});

// Step 4: Core presents plan to user for approval
presentPlan({
  database_changes: migrationPlan,
  api_changes: await planAPIChanges(),
  code_generation: await planCodeGen()
});
```

### How Core Reads Dev Setup

```javascript
// Core SpecForge /specforge:init command

// Read dev-setup skill from each installed plugin
const postgresSetup = await invokeSkill('specforge-db-postgresql/postgresql-dev-setup');
const rustSetup = await invokeSkill('specforge-backend-rust-axum/rust-dev-setup');
const reactSetup = await invokeSkill('specforge-frontend-react-tanstack/react-dev-setup');

// Combine into unified docker-compose.yml
const dockerCompose = combineSetups([postgresSetup, rustSetup, reactSetup]);
```

---

## Database-Specific Expertise Examples

### PostgreSQL Plugin (`specforge-db-postgresql`)

**Unique Expertise**:
- JSONB and when to use it vs normalized tables
- Array types and GIN indexes
- Full-text search with tsvector
- Generated columns (PostgreSQL 12+)
- CTEs and window functions
- Partitioning strategies
- LISTEN/NOTIFY for pub/sub
- Transactional DDL (migrations in transactions)

**Skills**:
1. `postgresql-expert.md` - All PostgreSQL-specific features
2. `postgresql-schema-design.md` - Schema patterns leveraging JSONB, arrays, etc.
3. `postgresql-migrations.md` - Safe migration strategies (can use transactions!)
4. `postgresql-performance.md` - EXPLAIN ANALYZE, index strategies
5. `postgresql-dev-setup.md` - Docker Compose + extensions (uuid-ossp, pgcrypto)

### MySQL Plugin (`specforge-db-mysql`)

**Unique Expertise**:
- Storage engines (InnoDB vs MyISAM)
- JSON type (different from PostgreSQL JSONB)
- Generated columns (VIRTUAL vs STORED)
- Full-text search with FULLTEXT indexes
- Partitioning (RANGE, LIST, HASH, KEY)
- Replication strategies
- Non-transactional DDL (migrations need different strategy)

**Skills**:
1. `mysql-expert.md` - MySQL-specific features (storage engines, JSON)
2. `mysql-schema-design.md` - Schema patterns for MySQL
3. `mysql-migrations.md` - Safe migrations (no transactional DDL!)
4. `mysql-performance.md` - Query cache, index hints, EXPLAIN
5. `mysql-dev-setup.md` - Docker Compose with MySQL-specific config

### SQLite Plugin (`specforge-db-sqlite`)

**Unique Expertise**:
- Embedded database (no server, file-based)
- Limited ALTER TABLE support
- FTS5 full-text search
- When to use SQLite vs server database
- Write-Ahead Logging (WAL mode)
- Backup strategies (VACUUM INTO)
- Migration limitations (can't drop columns before 3.35.0)

**Skills**:
1. `sqlite-expert.md` - SQLite features and limitations
2. `sqlite-schema-design.md` - Schema patterns within SQLite constraints
3. `sqlite-migrations.md` - Migration strategies with limited ALTER TABLE
4. `sqlite-performance.md` - Indexes, ANALYZE, PRAGMA optimization
5. `sqlite-dev-setup.md` - Docker setup (or just local file)

### MongoDB Plugin (`specforge-db-mongodb`)

**Unique Expertise**:
- Document-oriented (vs relational)
- Schema design for documents (embedding vs referencing)
- Aggregation pipeline
- Indexes on nested fields
- Transactions (multi-document ACID in 4.0+)
- Sharding strategies
- No migrations (schemaless) but data migration patterns

**Skills**:
1. `mongodb-expert.md` - MongoDB concepts and features
2. `mongodb-schema-design.md` - Document modeling patterns
3. `mongodb-migrations.md` - Data migration patterns (no schema migrations)
4. `mongodb-performance.md` - Index strategies, aggregation optimization
5. `mongodb-dev-setup.md` - Docker Compose with replica set

---

## Reference Implementation: PostgreSQL

### Complete File Examples

**`skills/postgresql-migrations.md`** (excerpt):

```markdown
# PostgreSQL Migration Best Practices

## Adding Columns

### ✓ Safe: Nullable Column

```sql
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
```
No data migration, instant, no locks.

### ✓ Safe: Column with Default (PostgreSQL 11+)

```sql
ALTER TABLE users ADD COLUMN verified BOOLEAN NOT NULL DEFAULT false;
```
In PostgreSQL 11+, adding column with DEFAULT doesn't rewrite table.

### ✗ Unsafe: NOT NULL without Default (PostgreSQL <11)

```sql
ALTER TABLE users ADD COLUMN phone VARCHAR(20) NOT NULL;
```
Fails if table has data. Use two-step migration:

```sql
-- Step 1: Add nullable
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Step 2: Populate data
UPDATE users SET phone = '+1-000-0000' WHERE phone IS NULL;

-- Step 3: Add constraint
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
```

## Changing Column Types

### ✓ Safe: Expanding VARCHAR

```sql
ALTER TABLE users ALTER COLUMN username TYPE VARCHAR(100);
```
Safe if increasing size (no data loss).

### ⚠️ Requires Rewrite: Changing Type

```sql
ALTER TABLE users ALTER COLUMN age TYPE BIGINT USING age::BIGINT;
```
Rewrites entire table. For large tables, consider two-step with new column:

```sql
-- Step 1: Add new column
ALTER TABLE users ADD COLUMN age_new BIGINT;

-- Step 2: Backfill in batches
UPDATE users SET age_new = age::BIGINT WHERE age_new IS NULL LIMIT 1000;

-- Step 3: Drop old, rename new
ALTER TABLE users DROP COLUMN age;
ALTER TABLE users RENAME COLUMN age_new TO age;
```

## Adding Indexes

### ✓ Safe: CONCURRENTLY (no table lock)

```sql
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```
Doesn't block writes, takes longer but safe for production.

### ✗ Unsafe: Regular Index (locks table)

```sql
CREATE INDEX idx_users_email ON users(email);
```
Locks table for writes. Only use on small tables or during maintenance window.
```

**`agents/migration-planner.md`** (excerpt):

```markdown
---
name: migration-planner
model: sonnet
context_budget: 10000
description: Plans safe PostgreSQL schema migrations
---

# PostgreSQL Migration Planner

You analyze schema changes and create safe, step-by-step migration plans.

## Your Task

Given:
1. **Current schema**: Existing database tables
2. **Desired changes**: What needs to change

You will:
1. Break changes into safe, atomic steps
2. Identify potential issues (data loss, locks, downtime)
3. Provide rollback SQL for each step
4. Estimate impact and downtime

## Example Input

```json
{
  "task": "plan-migration",
  "current_schema": {
    "tables": {
      "users": {
        "columns": {
          "id": "BIGSERIAL PRIMARY KEY",
          "email": "VARCHAR(255) NOT NULL"
        }
      }
    }
  },
  "desired_changes": [
    "Add users.email_verified boolean column",
    "Add unique index on users.email (case-insensitive)"
  ]
}
```

## Your Output Format

```json
{
  "status": "completed",
  "migration_steps": [
    {
      "step": 1,
      "description": "Add email_verified column with default",
      "sql": "ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT false;",
      "rationale": "PostgreSQL 11+ allows NOT NULL with DEFAULT without table rewrite",
      "safety": "safe",
      "blocking": false,
      "rollback_sql": "ALTER TABLE users DROP COLUMN email_verified;"
    },
    {
      "step": 2,
      "description": "Create case-insensitive unique index on email",
      "sql": "CREATE UNIQUE INDEX CONCURRENTLY idx_users_email_lower ON users(LOWER(email));",
      "rationale": "CONCURRENTLY prevents table lock, functional index for case-insensitivity",
      "safety": "safe",
      "blocking": false,
      "rollback_sql": "DROP INDEX CONCURRENTLY idx_users_email_lower;",
      "prerequisites": ["Check for duplicate emails: SELECT LOWER(email), COUNT(*) FROM users GROUP BY LOWER(email) HAVING COUNT(*) > 1;"]
    }
  ],
  "warnings": [
    "Step 2 requires no duplicate emails (case-insensitive) - check prerequisite query first"
  ],
  "estimated_downtime": "0 seconds (all operations non-blocking)"
}
```

## Migration Safety Rules

1. **Always use CONCURRENTLY for indexes** on large tables
2. **Prefer DEFAULT over two-step** for new NOT NULL columns (PostgreSQL 11+)
3. **Never change types directly** on large tables - use new column + backfill + rename
4. **Always provide rollback SQL**
5. **Warn about data prerequisites** (e.g., duplicate checks before unique index)
6. **Consider batch updates** for large data migrations

## Access Knowledge

You have access to these skills:
- `postgresql-expert` - Core PostgreSQL knowledge
- `postgresql-migrations` - Migration patterns and safety guidelines

Use these skills to inform your migration plans.

---

## Best Practices Summary

1. **Focused Expertise**: Each skill covers one knowledge domain deeply
2. **Workflow Separation**: Each distinct task = separate agent
3. **Standardized Setup**: Always provide `{tech}-dev-setup.md` for Docker Compose orchestration
4. **Database-Specific**: Teach Claude the unique features of your database
5. **Safety First**: Migration planning should prioritize safety and zero downtime
6. **Examples**: Include real-world schema examples in `examples/`
7. **Clear Reasoning**: Agents should explain WHY (rationale for decisions)
8. **Rollback Support**: Always provide rollback SQL in migration plans
9. **Compatibility**: Declare which backend/codegen plugins work with this database

---

## Quick Start Checklist

- [ ] Choose database (PostgreSQL, MySQL, SQLite, MongoDB, etc.)
- [ ] Create `plugin.json` with `specforge` metadata
- [ ] Create 5 required skills:
  - [ ] `{db}-expert.md` - Core database knowledge
  - [ ] `{db}-schema-design.md` - Schema patterns
  - [ ] `{db}-migrations.md` - Migration strategies
  - [ ] `{db}-performance.md` - Query optimization
  - [ ] `{db}-dev-setup.md` - Docker Compose setup ⭐
- [ ] Create 2 required agents:
  - [ ] `schema-designer.md` - Designs schemas
  - [ ] `migration-planner.md` - Plans migrations
- [ ] Add example schemas in `examples/`
- [ ] Test with compatible codegen/backend plugins
- [ ] Document unique database features
- [ ] Submit with `/plugin-builder:publish`

---

**End of Database Plugin Implementation Guide**