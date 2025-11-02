---
name: build
description: Apply specs, generate code, implement handlers with test-driven iteration
---

# SpecForge Build Orchestrator

Apply spec changes, run code generation, implement handlers, test and iterate until everything works.

## Overview

The build process is orchestrated in phases:

1. **Apply Spec Changes** - Update OpenAPI and database schemas
2. **Code Generation** - Generate type-safe code from schemas
3. **Handler Implementation** - Implement business logic in parallel
4. **Test & Iterate** - Run tests, observe behavior, fix issues
5. **Integration** - Wire everything together and verify

## Phase 1: Apply Spec Changes

### Apply Database Migrations

Read the SpecForge configuration from CLAUDE.md to identify the database plugin:

```bash
# Extract database plugin from CLAUDE.md
grep "database:" CLAUDE.md | cut -d: -f2 | tr -d ' '
```

Use the database plugin's migration skill:

```
Invoke the {database-plugin}/migrations-expert skill with:
- action: "apply-migrations"
- migrations_dir: "migrations/"
- database_url: from environment or docker-compose
```

Steps:

1. List pending migrations
2. Backup database (if production)
3. Apply migrations in order
4. Verify schema matches expected state
5. Handle errors (rollback if needed)

### Verify OpenAPI Spec

Use the **openapi-expert** skill to validate the spec:

```
Invoke openapi-expert skill with:
- action: "validate-spec"
- spec_path: "spec/openapi.yaml"
```

Validation checks:

- Valid OpenAPI 3.x syntax
- All $ref references resolve
- Schemas are well-formed
- Examples match schemas
- No duplicate operation IDs

## Phase 2: Code Generation

### Run Codegen Pipeline (DB Schema → Types)

Identify the codegen plugin from CLAUDE.md:

```bash
grep "codegen:" CLAUDE.md | cut -d: -f2 | tr -d ' '
```

Invoke the codegen plugin's generation skill:

```
Use {codegen-plugin}/codegen-expert skill with:
- action: "generate-from-schema"
- schema_dir: "migrations/"
- output_dir: "{backend-path}/src/generated/db"
- database_url: from environment
```

This generates:

- Type-safe database models (structs, classes, types)
- Query functions with compile-time verification
- Database client code
- Schema types and enums

**Example for rust-sql codegen:**

```rust
// Generated: backend/src/generated/db/models.rs
#[derive(Debug, Clone, sqlx::FromRow)]
pub struct Order {
    pub id: i64,
    pub user_id: i64,
    pub total_cents: i64,
    pub status: OrderStatus,
    pub created_at: chrono::DateTime<Utc>,
}

#[derive(Debug, Clone, sqlx::Type)]
#[sqlx(type_name = "TEXT")]
pub enum OrderStatus {
    Pending,
    Completed,
    Cancelled,
}

// Generated: backend/src/generated/db/queries.rs
pub async fn get_orders_by_user_id(
    pool: &SqlitePool,
    user_id: i64,
    limit: i64,
    offset: i64,
) -> Result<Vec<Order>, sqlx::Error> {
    sqlx::query_as!(
        Order,
        r#"
        SELECT id, user_id, total_cents, status as "status: OrderStatus",
               created_at
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
        "#,
        user_id,
        limit,
        offset
    )
    .fetch_all(pool)
    .await
}
```

### Generate OpenAPI Types

Identify the backend plugin:

```bash
grep "backend:" CLAUDE.md | cut -d: -f2 | tr -d ' '
```

Invoke backend plugin's OpenAPI type generation:

```
Use {backend-plugin}/openapi-types-expert skill with:
- action: "generate-types"
- spec: "spec/openapi.yaml"
- output: "{backend-path}/src/generated/api"
```

This generates:

- Request/Response DTOs
- Validation schemas
- Serialization/Deserialization code

### Frontend Client Generation (Optional)

If frontend plugin is configured:

```
Use {frontend-plugin}/codegen-expert skill with:
- action: "generate-client"
- spec: "spec/openapi.yaml"
- output: "{frontend-path}/src/api"
```

## Phase 3: Handler Implementation

### Parse OpenAPI Spec

Read the OpenAPI spec and extract all endpoints:

```javascript
const spec = parseYAML("spec/openapi.yaml");
const endpoints = [];

for (const [path, methods] of Object.entries(spec.paths)) {
  for (const [method, operation] of Object.entries(methods)) {
    if (["get", "post", "put", "patch", "delete"].includes(method)) {
      endpoints.push({
        path,
        method: method.toUpperCase(),
        operationId: operation.operationId,
        summary: operation.summary,
        description: operation.description,
        parameters: operation.parameters || [],
        requestBody: operation.requestBody,
        responses: operation.responses,
        complexity: assessComplexity(operation),
      });
    }
  }
}
```

### Assess Endpoint Complexity

For each endpoint, determine complexity to select appropriate agent model:

**Simple CRUD (Haiku)**:

- Single database query
- Basic validation
- Standard CRUD operation
- No transactions
- No external API calls

**Complex (Sonnet)**:

- Multiple database queries
- Transactions required
- Complex business logic
- External API integration
- Advanced error handling

### Parallel Handler Implementation

Group endpoints by complexity and spawn handler agents in parallel (max 5 concurrent):

```javascript
const simpleEndpoints = endpoints.filter((e) => e.complexity === "simple");
const complexEndpoints = endpoints.filter((e) => e.complexity === "complex");

// Process in batches of 5
const batches = chunk([...simpleEndpoints, ...complexEndpoints], 5);

for (const batch of batches) {
  const results = await Promise.all(
    batch.map((endpoint) => {
      const agentModel = endpoint.complexity === "simple" ? "haiku" : "sonnet";
      const backendPlugin = getBackendPlugin(); // from CLAUDE.md

      return invokeAgent(`${backendPlugin}/handler-agent`, {
        model: agentModel,
        endpoint: endpoint,
        generated_db_types: `${backendPath}/src/generated/db`,
        generated_api_types: `${backendPath}/src/generated/api`,
        patterns: getBackendPatterns(backendPlugin),
      });
    })
  );

  // Track results for Phase 4
  handlerResults.push(...results);
}
```

### Handler Agent Instructions

Each handler agent receives:

**Context**:

```json
{
  "endpoint": {
    "path": "/api/users/{id}/orders",
    "method": "GET",
    "description": "...",
    "parameters": [...],
    "responses": {...}
  },
  "generated_db_types": "backend/src/generated/db",
  "generated_api_types": "backend/src/generated/api",
  "patterns": "Framework-specific patterns documentation"
}
```

**Instructions**:

```
1. Import generated database models and queries
2. Import generated API request/response types
3. Implement handler following framework patterns
4. Use ONLY generated queries - NO manual SQL
5. Handle all error cases from OpenAPI spec
6. Add logging for debugging
7. Return handler file path when complete
```

**Example Handler Implementation (Rust/Axum)**:

```rust
// backend/src/handlers/orders.rs

use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};

// Import generated types
use crate::generated::db::{get_orders_by_user_id, get_user_by_id, count_orders_by_user_id};
use crate::generated::api::{OrdersResponse, Pagination, PaginationParams};
use crate::error::ApiError;
use crate::AppState;

pub async fn get_user_orders(
    State(state): State<AppState>,
    Path(user_id): Path<i64>,
    Query(params): Query<PaginationParams>,
) -> Result<impl IntoResponse, ApiError> {
    // 1. Validate user exists
    let _user = get_user_by_id(&state.db, user_id)
        .await?
        .ok_or(ApiError::NotFound("User not found".to_string()))?;

    // 2. Calculate offset from page
    let limit = params.limit.min(100); // Enforce max
    let offset = (params.page - 1) * limit;

    // 3. Get orders using generated query
    let orders = get_orders_by_user_id(&state.db, user_id, limit, offset).await?;

    // 4. Get total count for pagination
    let total = count_orders_by_user_id(&state.db, user_id).await?;

    // 5. Build response
    Ok(Json(OrdersResponse {
        data: orders,
        pagination: Pagination {
            page: params.page,
            limit,
            total,
            total_pages: (total + limit - 1) / limit,
        },
    }))
}
```

## Phase 4: Test & Iterate

For each implemented handler, run a test-driven iteration loop:

### Test Generation & Execution

```javascript
for (const handler of handlerResults) {
  let success = false;
  let iterationCount = 0;
  const MAX_ITERATIONS = 3;

  while (!success && iterationCount < MAX_ITERATIONS) {
    // 1. Generate and run tests
    const testResult = await invokeAgent(`${backendPlugin}/test-agent`, {
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

    // 2. Diagnose issues
    const diagnostic = await invokeAgent(`${codegenPlugin}/diagnostics-agent`, {
      model: "sonnet",
      handler_path: handler.path,
      errors: testResult.errors,
      compile_errors: testResult.compile_errors,
      test_failures: testResult.test_failures,
      generated_code_path: handler.generated_types,
    });

    // 3. Apply fixes
    await applyFixes(diagnostic.fixes);

    iterationCount++;
  }

  if (!success) {
    console.error(
      `✗ Failed to get ${handler.endpoint.path} working after ${MAX_ITERATIONS} iterations`
    );
    console.error("Last errors:", testResult.errors);

    // Ask user for guidance
    const userDecision = await askUser({
      question: `Handler for ${handler.endpoint.path} failed tests. What should I do?`,
      options: [
        "Skip for now and continue",
        "Try again with more iterations",
        "Show me the errors and let me fix it",
        "Abort the build",
      ],
    });

    handleUserDecision(userDecision);
  }
}
```

### Test Agent Responsibilities

The test agent should:

1. **Generate Unit Tests**:

   - Test handler logic with mocked database
   - Test validation rules
   - Test error cases from OpenAPI

2. **Generate Integration Tests**:

   - Full HTTP request → database → response flow
   - Test with real database (test fixtures)
   - Verify response format matches OpenAPI

3. **Run Tests**:

   - Execute test suite
   - Capture compile errors, test failures, runtime errors
   - Return detailed error information

4. **Behavior Observation**:
   - Log SQL queries executed
   - Verify response schema matches OpenAPI
   - Check error responses

### Diagnostics Agent Responsibilities

When tests fail, the diagnostics agent analyzes:

1. **Compile Errors**:

   - Type mismatches between generated code and handler
   - Missing imports
   - Incorrect function signatures

2. **Test Failures**:

   - Logic errors in handler implementation
   - Incorrect query parameters
   - Response format issues

3. **Runtime Errors**:
   - Database connection issues
   - Query errors (schema mismatches)
   - Serialization failures

**Diagnostic Output**:

```json
{
  "status": "errors_found",
  "issues": [
    {
      "type": "compile_error",
      "location": "backend/src/handlers/orders.rs:45",
      "message": "expected i64, found i32",
      "fix": "Change parameter type to i64 to match generated query signature"
    },
    {
      "type": "test_failure",
      "test": "test_get_user_orders_pagination",
      "message": "assertion failed: total_pages == 3",
      "fix": "Pagination calculation is incorrect. Use (total + limit - 1) / limit"
    }
  ],
  "fixes": [
    {
      "file": "backend/src/handlers/orders.rs",
      "changes": [...]
    }
  ]
}
```

## Phase 5: Integration & Verification

### Wire Up Handlers to Router

Once all handlers pass tests, wire them to the router:

```
Use {backend-plugin}/integration-expert skill with:
- action: "wire-handlers"
- handlers: [list of handler file paths]
- output: "{backend-path}/src/main" or router file
```

**Example Router Integration (Rust/Axum)**:

```rust
// backend/src/main.rs

mod handlers;
mod generated;
mod error;

use axum::{
    routing::{get, post, patch},
    Router,
};

#[tokio::main]
async fn main() {
    // Database connection
    let db = setup_database().await;

    let app_state = AppState { db };

    // Router with all handlers
    let app = Router::new()
        .route("/api/users/:id/orders", get(handlers::orders::get_user_orders))
        .route("/api/orders", post(handlers::orders::create_order))
        .route("/api/orders/:id", get(handlers::orders::get_order))
        .route("/api/orders/:id", patch(handlers::orders::update_order_status))
        .with_state(app_state);

    // Start server
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

### Run Full Integration Tests

```bash
# Start services
docker-compose up -d

# Wait for health checks
docker-compose exec api curl http://localhost:3000/health

# Run integration test suite
docker-compose exec api cargo test --test integration
```

### Verify Against OpenAPI Spec

Use validation tools to ensure API matches spec:

```bash
# Generate Prism mock server from OpenAPI spec
npx @stoplight/prism-cli mock spec/openapi.yaml

# Run contract tests
docker-compose exec api cargo test --test contract_tests
```

## Build Summary

Provide comprehensive build report:

```
✓ Build Complete!

Phase 1: Spec Changes
  ✓ Applied 1 database migration (003_add_orders.sql)
  ✓ Validated OpenAPI spec

Phase 2: Code Generation
  ✓ Generated database models (Order, OrderItem)
  ✓ Generated query functions (5 functions)
  ✓ Generated API types (OrdersResponse, CreateOrderRequest)

Phase 3: Handler Implementation
  ✓ Implemented 4 handlers (2 simple, 2 complex)
  - GET /api/users/{id}/orders (Haiku)
  - GET /api/orders/{id} (Haiku)
  - POST /api/orders (Sonnet)
  - PATCH /api/orders/{id} (Sonnet)

Phase 4: Testing
  ✓ Generated 12 unit tests
  ✓ Generated 4 integration tests
  ✓ All tests passing

Phase 5: Integration
  ✓ Wired handlers to router
  ✓ Verified against OpenAPI spec

Build Statistics:
- Time: 45 minutes
- Tokens used: 48,000
- Cost: ~$0.45
- Files modified: 8
- Tests created: 16

Next Steps:
1. Run `/specforge:test` for full test suite
2. Run `/specforge:validate` to validate everything
3. Start services: docker-compose up -d
4. Test manually: curl http://localhost:3000/api/users/1/orders
```

## Error Handling

### Migration Failures

If migration fails:

1. Show error details
2. Offer to rollback
3. Let user fix migration file
4. Retry

### Code Generation Failures

If codegen fails:

1. Check schema syntax
2. Verify database connection
3. Check codegen tool installation
4. Show tool-specific error messages

### Handler Implementation Failures

If handler agent fails:

1. Show implementation errors
2. Offer to retry with Sonnet (if was Haiku)
3. Let user implement manually
4. Skip and continue with other handlers

### Test Failures Beyond Max Iterations

If tests still fail after 3 iterations:

1. Show detailed error report
2. Ask user to review implementation
3. Offer to continue with other handlers
4. Create TODO for manual fix

## Implementation Notes

- Track state in `.specforge/build-state.json`
- Log all agent interactions for debugging
- Create backups before applying changes
- Use transactions where possible
- Provide detailed error messages
- Allow resuming from failed phase

## Resources

- **Parallel Processing**: Max 5 concurrent agents
- **Context Budget**: <5K per Haiku, <15K per Sonnet
- **Retry Logic**: Max 3 iterations per handler
- **State Persistence**: `.specforge/build-state.json`
