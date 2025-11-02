---
name: sync
description: Sync codebase after spec changes (OpenAPI + DB schema)
---

# SpecForge Sync Command

Synchronize your codebase after manual changes to OpenAPI spec or database schema. This command detects changes and regenerates code to keep everything in sync.

## Overview

The sync command is useful when:

1. You've manually edited `spec/openapi.yaml`
2. You've added/modified database migrations
3. You've pulled changes from version control that include spec updates
4. You need to regenerate code after resolving merge conflicts

**Sync orchestrates:**

- Detecting spec changes since last sync
- Validating updated specifications
- Regenerating type-safe code from schemas
- Identifying affected handlers that need updates
- Running tests to verify everything still works

## Sync Process

### Step 1: Detect Changes

Identify what has changed since the last successful build:

```bash
# Check for OpenAPI spec changes
if [ -f spec/openapi.yaml ]; then
    echo "Checking OpenAPI spec for changes..."
    # Compare with last known state (stored in .specforge/last-sync.json)
fi

# Check for new database migrations
echo "Checking for new migrations..."
ls -t migrations/*.sql | head -5

# Check for schema changes in existing migrations
git diff HEAD~1 migrations/ 2>/dev/null || echo "Not a git repository or no previous commits"
```

Categorize changes:

- **OpenAPI only**: New/modified endpoints, schemas, examples
- **Database only**: New migrations, schema alterations
- **Both**: Coordinated changes to API and database

### Step 2: Validate Updated Specifications

#### Validate OpenAPI Spec

Use the **openapi-expert** skill:

```
Invoke openapi-expert skill with:
- action: "validate-spec"
- spec_path: "spec/openapi.yaml"
```

Validation checks:

- Valid OpenAPI 3.x syntax
- All $ref references resolve
- Request/response schemas are valid
- Examples match schemas
- No duplicate operation IDs
- Descriptions include business logic details

#### Validate Database Schema

Read SpecForge configuration to identify database plugin:

```bash
grep "database:" CLAUDE.md | cut -d: -f2 | tr -d ' '
```

Use database plugin's validation skill:

```
Invoke {database-plugin}/migrations-expert skill with:
- action: "validate-migrations"
- migrations_dir: "migrations/"
```

Validation checks:

- Migration files are numbered sequentially
- No syntax errors in SQL
- Foreign keys reference existing tables
- Indexes are properly defined
- No breaking changes (unless acknowledged)

### Step 3: Apply Database Migrations

If new migrations are detected, apply them:

```
Invoke {database-plugin}/migrations-expert skill with:
- action: "apply-migrations"
- migrations_dir: "migrations/"
- database_url: from environment or docker-compose
```

Steps:

1. List pending migrations
2. Show what will be applied
3. Ask user for confirmation
4. Backup database (if production)
5. Apply migrations in transaction
6. Verify schema state
7. Handle errors with rollback

**Interactive Confirmation:**

Use **AskUserQuestion** to confirm migration:

```
Found 2 new migrations:
  - 003_add_orders_table.sql
  - 004_add_order_items_table.sql

These migrations will:
  - Create orders table with indexes
  - Create order_items table with foreign keys
  - Add trigger for order total calculation

Apply these migrations?
```

Options:

- Apply migrations now
- Review migrations first
- Skip migrations (code generation only)
- Cancel sync

### Step 4: Regenerate Code from Schemas

#### Database Code Generation

Identify codegen plugin from CLAUDE.md:

```bash
grep "codegen:" CLAUDE.md | cut -d: -f2 | tr -d ' '
```

Run codegen pipeline:

```
Invoke {codegen-plugin}/codegen-expert skill with:
- action: "generate-from-schema"
- schema_dir: "migrations/"
- output_dir: "{backend-path}/src/generated/db"
- database_url: from environment
- force: true  # Regenerate even if files exist
```

This regenerates:

- Database models (structs, classes, types)
- Type-safe query functions
- Schema types and enums
- Database client code

#### OpenAPI Type Generation

Identify backend plugin from CLAUDE.md:

```bash
grep "backend:" CLAUDE.md | cut -d: -f2 | tr -d ' '
```

Generate API types:

```
Invoke {backend-plugin}/openapi-types-expert skill with:
- action: "generate-types"
- spec: "spec/openapi.yaml"
- output: "{backend-path}/src/generated/api"
- force: true  # Regenerate even if files exist
```

This regenerates:

- Request/response DTOs
- Validation schemas
- Serialization/deserialization code
- API client types

#### Frontend Client Generation (if applicable)

If frontend plugin is configured:

```bash
grep "frontend:" CLAUDE.md | cut -d: -f2 | tr -d ' '
```

```
Invoke {frontend-plugin}/codegen-expert skill with:
- action: "generate-client"
- spec: "spec/openapi.yaml"
- output: "{frontend-path}/src/api"
- force: true
```

### Step 5: Identify Affected Handlers

Analyze which handlers are affected by spec changes:

```bash
# Compare current spec with previous version
# Identify new, modified, or deleted endpoints

# For each modified endpoint:
# - Check if handler exists
# - Verify handler signature matches new types
# - Flag for review/reimplementation
```

**Report to user:**

```markdown
## Sync Summary

### Code Regenerated

- ✓ Database models: 15 types regenerated
- ✓ Database queries: 32 functions regenerated
- ✓ API types: 8 request/response types regenerated
- ✓ Frontend client: API client regenerated

### Handlers Affected

**Needs Update:**

- `GET /api/users/{id}/orders` - Response type changed
- `POST /api/orders` - Request validation rules changed

**Still Valid:**

- `GET /api/users` - No changes
- `POST /api/users` - No changes

**New (Not Implemented):**

- `PATCH /api/orders/{id}` - New endpoint, needs implementation

### Next Steps

1. Review affected handlers above
2. Update handlers with new types: `/specforge:build` (will only rebuild affected handlers)
3. Run tests: `/specforge:test`
```

### Step 6: Compile and Test

Verify that generated code compiles:

```bash
# Backend compilation (example for Rust)
cd backend && cargo check 2>&1

# If TypeScript backend
cd backend && npm run type-check 2>&1

# If Python backend
cd backend && mypy . 2>&1
```

If compilation fails:

1. Collect error messages
2. Invoke **{codegen-plugin}/diagnostics-expert** skill
3. Fix schema/type mismatches
4. Regenerate code
5. Retry compilation

**Run existing tests:**

```bash
# Run backend tests
cd backend && cargo test 2>&1  # or npm test, pytest, etc.
```

Report test results:

```
## Test Results

- ✓ 127 tests passed
- ✗ 3 tests failed (affected by schema changes)
- ⚠ 2 tests skipped (handlers not implemented)

Failed tests:
  - test_get_user_orders - Response type mismatch
  - test_create_order - Request validation changed
  - test_order_total_calculation - New trigger behavior
```

### Step 7: Save Sync State

Update sync state file:

```json
// .specforge/last-sync.json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "openapi_spec_hash": "sha256:abc123...",
  "migrations_applied": [
    "001_init.sql",
    "002_add_users.sql",
    "003_add_orders.sql"
  ],
  "generated_files": [
    "backend/src/generated/db/models.rs",
    "backend/src/generated/db/queries.rs",
    "backend/src/generated/api/types.rs",
    "frontend/src/api/client.ts"
  ],
  "handlers_affected": ["GET /api/users/{id}/orders", "POST /api/orders"],
  "tests_status": {
    "passed": 127,
    "failed": 3,
    "skipped": 2
  }
}
```

### Step 8: Present Summary and Next Steps

Show user what was synced and what needs attention:

```markdown
## SpecForge Sync Complete

**Changes Detected:**

- 1 new database migration applied
- OpenAPI spec updated (3 endpoints modified)

**Code Regenerated:**

- ✓ Database models and queries
- ✓ API request/response types
- ✓ Frontend API client

**Action Required:**

1. **Update Handlers** (3 affected):

   - GET /api/users/{id}/orders - Response type changed
   - POST /api/orders - Request validation changed
   - PATCH /api/orders/{id} - New endpoint

   Run: `/specforge:build` to update/implement handlers

2. **Fix Failing Tests** (3 tests):

   Run: `/specforge:test` after handler updates

**Next Command:**

`/specforge:build` - Implement/update affected handlers
```

Use **AskUserQuestion** to get next action:

- Update affected handlers now (`/specforge:build`)
- Run validation first (`/specforge:validate`)
- Review changes manually
- Skip for now

## Use Cases

### Use Case 1: After Pulling Changes

```bash
# Teammate added new endpoints to OpenAPI spec
git pull origin main

# Sync to regenerate code
/specforge:sync
```

### Use Case 2: After Manual Spec Editing

```yaml
# You manually edited spec/openapi.yaml
# Added new endpoint: GET /api/products
paths:
  /api/products:
    get:
      summary: List products
      # ... endpoint definition

# Sync to generate types and scaffold handler
/specforge:sync
```

### Use Case 3: After Database Migration

```bash
# You created a new migration file
cat > migrations/005_add_products.sql <<EOF
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price_cents INTEGER NOT NULL
);
EOF

# Sync to apply migration and generate types
/specforge:sync
```

### Use Case 4: After Merge Conflict Resolution

```bash
# Resolved conflicts in spec/openapi.yaml and migrations/
git merge feature-branch
# ... resolved conflicts ...
git add spec/openapi.yaml migrations/
git commit -m "Merge feature-branch"

# Sync to regenerate everything
/specforge:sync
```

## Sync vs Build

**When to use `/specforge:sync`:**

- Specs changed externally (git pull, manual edit, merge)
- Need to regenerate code from updated schemas
- Want to detect what changed without full rebuild

**When to use `/specforge:build`:**

- Implementing new features from scratch
- Following a `/specforge:plan`
- Applying spec changes AND implementing handlers in one go

**Relationship:**

```
/specforge:plan   →  Propose spec changes
                  ↓
/specforge:build  →  Apply specs + implement handlers + test
                  ↓
/specforge:sync   →  Regenerate after external spec changes
```

## Configuration

Sync behavior can be customized in CLAUDE.md:

```markdown
## SpecForge Configuration

- backend: rust-axum
- database: sqlite
- codegen: rust-sql
- frontend: react-tanstack

### Sync Options

- auto_apply_migrations: false # Require confirmation
- regenerate_on_conflict: true # Auto-regenerate on file conflicts
- run_tests_after_sync: true # Run tests automatically
- backup_before_migration: true # Backup DB before applying migrations
```

## Safety Features

### 1. Backup Before Migration

Always backup database before applying migrations (unless in development mode):

```bash
# Production/staging: backup first
if [ "$ENV" != "development" ]; then
    echo "Backing up database..."
    # Use database plugin backup skill
fi
```

### 2. Dry Run Mode

Show what would happen without making changes:

```
/specforge:sync --dry-run

Would apply:
  - migrations/003_add_orders.sql
  - migrations/004_add_order_items.sql

Would regenerate:
  - backend/src/generated/db/*
  - backend/src/generated/api/*
  - frontend/src/api/*

No changes made (dry run).
```

### 3. Rollback on Error

If migration or code generation fails, rollback changes:

```
Error applying migration 003_add_orders.sql:
  - Foreign key constraint failed

Rolling back migration...
Database restored to previous state.

Sync failed. Please fix migration and try again.
```

## Troubleshooting

### Issue: "Migration out of order"

```
Error: Migration 005_xxx.sql has timestamp before 004_xxx.sql
```

**Solution:** Rename migration file with correct sequential number.

### Issue: "Generated code conflicts with manual changes"

```
Warning: backend/src/generated/db/models.rs has been manually modified
```

**Solution:**

- Move custom code out of `generated/` directory
- Use partial classes/extensions (if language supports it)
- Accept regeneration and reapply manual changes

### Issue: "OpenAPI spec invalid after sync"

```
Error: Invalid $ref in spec/openapi.yaml:
  - #/components/schemas/Order not found
```

**Solution:** Fix OpenAPI spec, then re-run sync.

### Issue: "Compilation fails after sync"

```
Error: Type mismatch in handler
  - Expected: OrderResponse
  - Found: Order
```

**Solution:** Run `/specforge:build` to update handlers with new types.

## Resources

- **OpenAPI Spec Validation**: https://redocly.com/docs/cli/
- **Database Migrations Best Practices**: https://www.postgresql.org/docs/current/ddl-alter.html
- **Git Conflict Resolution**: https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging
- **Code Generation Patterns**: https://openapi-generator.tech/

## Related Commands

- `/specforge:plan` - Generate implementation plan for new features
- `/specforge:build` - Full build pipeline (specs + handlers + tests)
- `/specforge:validate` - Validate specs and code without regenerating
- `/specforge:test` - Run test suite
