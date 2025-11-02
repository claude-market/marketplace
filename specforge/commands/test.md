---
name: test
description: Test orchestration with behavior observation and iterative fixing
---

# SpecForge Test Orchestrator

Run comprehensive tests with behavior observation, diagnose failures, and iterate until all tests pass.

## Overview

The test orchestrator runs tests at multiple levels and uses behavior observation to diagnose and fix issues:

1. **Unit Tests** - Test individual handlers and functions
2. **Integration Tests** - Test API endpoints end-to-end
3. **Contract Tests** - Verify API matches OpenAPI spec
4. **Behavior Observation** - Monitor test execution to identify issues
5. **Iterative Fixing** - Diagnose and fix failures automatically

## Test Orchestration Flow

```
┌─────────────────────────────────────────────┐
│  /specforge:test                             │
└─────────────────┬───────────────────────────┘
                  │
    ┌─────────────┼─────────────┬──────────────┐
    ▼             ▼             ▼              ▼
┌────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐
│ Unit   │  │ Integration│ │ Contract │  │ E2E Tests   │
│ Tests  │  │ Tests     │  │ Tests    │  │ (optional)  │
└────┬───┘  └─────┬────┘  └─────┬────┘  └──────┬──────┘
     │            │             │              │
     └────────────┴─────────────┴──────────────┘
                  │
                  ▼
       ┌──────────────────────┐
       │ Behavior Observation │
       │ & Failure Diagnosis  │
       └──────────────────────┘
                  │
                  ▼
       ┌──────────────────────┐
       │ Iterate & Fix        │
       │ (Max 3 iterations)   │
       └──────────────────────┘
```

## Step 1: Read Configuration

Extract the tech stack configuration from CLAUDE.md:

```bash
# Read SpecForge configuration
grep "SpecForge configuration" -A 10 CLAUDE.md
```

Extract:

- Backend plugin
- Database plugin
- Codegen plugin
- Frontend plugin (if applicable)

## Step 2: Unit Tests

Run unit tests for the backend using the backend plugin's testing expert:

```bash
# Get backend plugin
BACKEND_PLUGIN=$(grep "backend:" CLAUDE.md | cut -d: -f2 | tr -d ' ')
```

Invoke the backend plugin's test agent:

```
Use {backend-plugin}/test-agent skill with:
- action: "run-unit-tests"
- test_dir: "backend/tests/unit"
- coverage: true
```

**Checks:**

- All unit tests pass
- Code coverage meets threshold (default: 80%)
- No test failures or errors
- Mock setup correct
- Edge cases covered

**Technology-Specific Commands:**

**Rust:**

```bash
cd backend && cargo test --lib
cargo tarpaulin --out Html --output-dir coverage/
```

**TypeScript/Node:**

```bash
cd backend && npm test -- --coverage
```

**Python:**

```bash
cd backend && pytest tests/unit --cov=src --cov-report=html
```

**Go:**

```bash
cd backend && go test ./... -cover -coverprofile=coverage.out
```

## Step 3: Integration Tests

Run integration tests that test full request-to-response flows:

```
Use {backend-plugin}/test-agent skill with:
- action: "run-integration-tests"
- test_dir: "tests/integration"
- database_url: test database URL
```

**Test Pattern:**

Each endpoint should have integration tests:

```rust
// Example Rust integration test
#[tokio::test]
async fn test_create_order_success() {
    // Setup test database
    let db = setup_test_db().await;
    let app = create_test_app(db.clone()).await;

    // Create test user
    let user = create_test_user(&db).await;

    // Test request
    let response = app
        .post("/api/orders")
        .json(&json!({
            "items": [{"product_id": 1, "quantity": 2}],
            "user_id": user.id
        }))
        .send()
        .await;

    // Assertions
    assert_eq!(response.status(), StatusCode::CREATED);
    let order: Order = response.json().await;
    assert_eq!(order.user_id, user.id);
    assert_eq!(order.status, OrderStatus::Pending);
}
```

**Checks:**

- HTTP status codes correct
- Response bodies match schemas
- Database state updated correctly
- Error handling works
- Authentication/authorization enforced
- Edge cases handled

## Step 4: Contract Testing

Verify that the running API matches the OpenAPI specification:

```
Use openapi-expert skill with:
- action: "contract-test"
- spec_path: "spec/openapi.yaml"
- api_url: "http://localhost:3000"
- test_report_path: "test-results/contract-tests.json"
```

**Tools:**

- **Schemathesis**: Property-based API testing from OpenAPI spec
- **Dredd**: HTTP API testing framework
- **Prism**: Mock server and contract testing

**Schemathesis Example:**

```bash
# Install schemathesis
pip install schemathesis

# Run contract tests
schemathesis run spec/openapi.yaml \
    --base-url http://localhost:3000 \
    --checks all \
    --hypothesis-max-examples=50
```

**Checks:**

- All endpoints respond correctly
- Response schemas match OpenAPI spec
- Status codes match spec
- Required fields present
- Type validation correct
- Examples in spec are valid

## Step 5: Behavior Observation & Diagnosis

Monitor test execution to identify patterns of failure:

```javascript
const testResults = {
  unit: { passed: [], failed: [] },
  integration: { passed: [], failed: [] },
  contract: { passed: [], failed: [] },
};

// Collect all failures
const allFailures = [
  ...testResults.unit.failed,
  ...testResults.integration.failed,
  ...testResults.contract.failed,
];

if (allFailures.length > 0) {
  // Analyze failure patterns
  const patterns = analyzeFailurePatterns(allFailures);

  // Categorize failures
  const categories = {
    typeErrors: [],
    databaseErrors: [],
    validationErrors: [],
    businessLogicErrors: [],
    networkErrors: [],
  };

  // Group by category for targeted fixing
  for (const failure of allFailures) {
    const category = categorizeFailure(failure);
    categories[category].push(failure);
  }
}
```

**Common Failure Patterns:**

1. **Type Mismatches**: Generated types don't match database schema
2. **Query Errors**: SQL queries fail or return wrong data
3. **Validation Errors**: Request validation fails unexpectedly
4. **Business Logic Errors**: Handler logic incorrect
5. **Schema Mismatches**: API responses don't match OpenAPI spec

## Step 6: Iterative Fixing

For each category of failures, invoke the appropriate diagnostics agent:

```javascript
const MAX_ITERATIONS = 3;
let iteration = 0;
let allTestsPassed = false;

while (!allTestsPassed && iteration < MAX_ITERATIONS) {
  iteration++;

  // Run tests
  const results = await runAllTests();

  if (results.allPassed) {
    allTestsPassed = true;
    break;
  }

  // Diagnose type/codegen issues
  if (results.typeErrors.length > 0) {
    await invokeAgent(`${codegenPlugin}/diagnostics-agent`, {
      model: "sonnet",
      errors: results.typeErrors,
      generated_code_path: "backend/src/generated",
      schema_path: "migrations/",
    });
  }

  // Diagnose handler/business logic issues
  if (results.businessLogicErrors.length > 0) {
    await invokeAgent(`${backendPlugin}/handler-agent`, {
      model: "sonnet",
      errors: results.businessLogicErrors,
      handlers_path: "backend/src/handlers",
    });
  }

  // Diagnose database/query issues
  if (results.databaseErrors.length > 0) {
    await invokeAgent(`${databasePlugin}/migration-agent`, {
      model: "haiku",
      errors: results.databaseErrors,
      migrations_path: "migrations/",
    });
  }

  // Re-run code generation if schema changed
  if (schemaChanged) {
    await regenerateCode();
  }
}

if (!allTestsPassed) {
  throw new Error(
    `Tests still failing after ${MAX_ITERATIONS} iterations. Manual intervention required.`
  );
}
```

## Step 7: Test Report Generation

Generate a comprehensive test report:

```markdown
# SpecForge Test Report

**Project**: my-api
**Date**: 2025-01-15
**Duration**: 45s
**Iterations**: 2

## Summary

- ✓ Unit Tests: 45/45 passed (100%)
- ✓ Integration Tests: 12/12 passed (100%)
- ✓ Contract Tests: 8/8 passed (100%)
- **Total**: 65/65 tests passed

## Coverage

- Line Coverage: 87%
- Branch Coverage: 82%
- Function Coverage: 95%

## Test Details

### Unit Tests (45 passed)

- ✓ handlers::users::create_user
- ✓ handlers::users::get_user
- ✓ handlers::orders::create_order
- ✓ handlers::orders::get_orders_by_user
- ... (41 more)

### Integration Tests (12 passed)

- ✓ POST /api/users - creates user successfully
- ✓ GET /api/users/:id - returns user
- ✓ POST /api/orders - creates order
- ✓ GET /api/users/:id/orders - returns user's orders
- ... (8 more)

### Contract Tests (8 passed)

- ✓ POST /api/users matches schema
- ✓ GET /api/users/:id matches schema
- ✓ POST /api/orders matches schema
- ... (5 more)

## Iterations

### Iteration 1

- 3 test failures
- Issues: Type mismatch in Order.created_at (expected DateTime, got String)
- Fix: Updated sql-gen type overrides
- Result: Re-ran codegen, 3 tests now pass

### Iteration 2

- All tests passed ✓

## Performance

- Average response time: 45ms
- Slowest endpoint: GET /api/users/:id/orders (120ms)
- Database queries: Average 15ms

## Recommendations

1. Add tests for error cases (400, 404, 500)
2. Add pagination tests for list endpoints
3. Add authentication/authorization tests
4. Consider adding load tests for critical endpoints
```

## Test Modes

### Quick Test (Default)

Run unit and integration tests only (skip contract tests):

```bash
/specforge:test
```

### Full Test (CI Mode)

Run all test suites including contract tests:

```bash
/specforge:test --full
```

### Specific Test Suite

Run a specific test suite:

```bash
/specforge:test --suite unit
/specforge:test --suite integration
/specforge:test --suite contract
```

### Watch Mode

Run tests continuously on file changes (development mode):

```bash
/specforge:test --watch
```

## Integration with CI/CD

Example GitHub Actions workflow:

```yaml
name: SpecForge Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Install SpecForge
        run: |
          /plugin install specforge
          /plugin install specforge-backend-rust-axum
          /plugin install specforge-db-postgresql
          /plugin install specforge-generate-rust-sql

      - name: Run Tests
        run: /specforge:test --full
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Testing Best Practices

1. **Write tests during development** - Don't wait until the end
2. **Test edge cases** - Empty lists, null values, boundary conditions
3. **Use behavior observation** - Let agents learn from test failures
4. **Iterate automatically** - Fix common issues without manual intervention
5. **Maintain high coverage** - Aim for >80% code coverage
6. **Test error handling** - Ensure proper error responses
7. **Use contract testing** - Verify API matches OpenAPI spec
8. **Test database constraints** - Ensure foreign keys, uniqueness work
9. **Clean test data** - Reset database between tests
10. **Mock external services** - Don't depend on third-party APIs

## Common Test Failures & Fixes

### Type Mismatch Errors

```
Error: Type mismatch - expected i64, found String
```

**Fix**: Update codegen type overrides:

```toml
# sql-gen.toml
[sql-gen.settings]
type_overrides = { "user_id" = "i64" }
```

Re-run: `/specforge:build`

### Database Constraint Violations

```
Error: FOREIGN KEY constraint failed
```

**Fix**: Ensure foreign key references exist in test setup:

```rust
// Create parent record first
let user = create_test_user(&db).await;

// Then create child record
let order = create_test_order(&db, user.id).await;
```

### Schema Validation Failures

```
Error: Response does not match schema - missing required field 'created_at'
```

**Fix**: Update handler to include all required fields:

```rust
// Ensure all schema fields are returned
Json(OrderResponse {
    id: order.id,
    user_id: order.user_id,
    total_cents: order.total_cents,
    status: order.status,
    created_at: order.created_at, // Don't forget this!
})
```

### Contract Test Failures

```
Error: Endpoint GET /api/users/:id returned 500, expected 200
```

**Fix**: Check handler error handling:

```rust
// Add proper error handling
let user = get_user_by_id(&db, id)
    .await?
    .ok_or(ApiError::NotFound)?;

Ok(Json(user))
```

## Resources

- **Schemathesis**: https://schemathesis.readthedocs.io/
- **Dredd**: https://dredd.org/
- **Prism**: https://stoplight.io/open-source/prism
- **Property-Based Testing**: https://hypothesis.readthedocs.io/
- **Test Coverage Tools**: https://github.com/marketplace/actions/codecov

## Frontend Testing (Optional)

If a frontend plugin is configured, run frontend tests:

```
Use {frontend-plugin}/test-expert skill with:
- action: "run-tests"
- test_dir: "frontend/tests"
```

**Frontend Test Types:**

- Component tests (unit)
- Integration tests (React Testing Library, etc.)
- E2E tests (Playwright, Cypress)
- Visual regression tests (optional)

**Example E2E Test (Playwright):**

```typescript
test("create order flow", async ({ page }) => {
  // Navigate to app
  await page.goto("http://localhost:5173");

  // Create order
  await page.click("text=New Order");
  await page.fill("[name=quantity]", "2");
  await page.click("text=Submit");

  // Verify order created
  await expect(page.locator(".order-list")).toContainText("Order #1");
});
```

---

**Test orchestration ensures your SpecForge project works correctly at all levels - from unit tests to end-to-end workflows.**
