---
name: validate
description: Multi-level validation (spec, schema, code, runtime) for SpecForge projects
---

# SpecForge Validation Orchestrator

Perform comprehensive validation across all levels of your SpecForge project: OpenAPI spec, database schema, generated code, and runtime behavior.

## Validation Levels

### Level 1: Specification Validation

Validate the OpenAPI specification for correctness and best practices.

```javascript
// Validate OpenAPI spec
await invokeSkill("openapi-expert", {
  action: "validate-spec",
  spec_path: "spec/openapi.yaml",
});
```

**Checks:**

- OpenAPI 3.x compliance
- Schema definitions are complete
- Required fields present
- No circular references
- Examples match schemas
- Response codes appropriate
- Security schemes defined
- Operation IDs unique

**Tools:**

- [Redocly CLI](https://redocly.com/docs/cli/) - `redocly lint spec/openapi.yaml`
- [Spectral](https://stoplight.io/open-source/spectral) - Custom linting rules

### Level 2: Database Schema Validation

Validate database schema for consistency and best practices.

```javascript
// Read CLAUDE.md to get database plugin
const config = await readCLAUDEmd();
const dbPlugin = config.specforge.database;

// Validate database schema
await invokeSkill(`specforge-db-${dbPlugin}/migrations-expert`, {
  action: "validate-schema",
  migrations_dir: "migrations/",
  database_url: process.env.DATABASE_URL,
});
```

**Checks:**

- Migration files are sequential
- No conflicting migrations
- Foreign key constraints valid
- Indexes defined appropriately
- Column types consistent
- No missing NOT NULL constraints on required fields
- Timestamps have defaults

**Tools:**

- Database-specific schema validators
- Migration consistency checks

### Level 3: Code Generation Validation

Validate that code generation succeeded and generated code is correct.

```javascript
// Read CLAUDE.md to get tech stack
const config = await readCLAUDEmd();
const backendPlugin = config.specforge.backend;
const codegenPlugin = config.specforge.codegen;

// Validate generated code exists
await invokeSkill(`${codegenPlugin}/diagnostics-expert`, {
  action: "validate-generated-code",
  generated_db_path: `${backendPlugin.path}/src/generated/db`,
  generated_api_path: `${backendPlugin.path}/src/generated/api`,
  database_schema_path: "migrations/",
});
```

**Checks:**

- Generated type files exist
- Generated query functions exist
- Types match database schema
- API types match OpenAPI spec
- No compilation errors
- No type mismatches

### Level 4: Compilation Validation

Ensure the project compiles successfully.

```javascript
// Run compilation
const config = await readCLAUDEmd();
const backendPlugin = config.specforge.backend;

await invokeSkill(`${backendPlugin}/testing-expert`, {
  action: "compile-check",
  project_path: backendPlugin.path,
});
```

**Checks (Technology-Specific):**

**Rust:**

```bash
cd backend && cargo check
cargo clippy -- -D warnings
```

**TypeScript:**

```bash
cd backend && npm run type-check
npm run lint
```

**Python:**

```bash
cd backend && mypy .
pylint src/
```

**Go:**

```bash
cd backend && go build ./...
go vet ./...
```

### Level 5: Runtime Validation

Validate runtime behavior through tests and contract testing.

```javascript
// Run test suite
await invokeSkill("test-orchestrator", {
  action: "run-all-tests",
  project_path: ".",
});

// Contract testing against OpenAPI spec
await invokeSkill("openapi-expert", {
  action: "contract-test",
  spec_path: "spec/openapi.yaml",
  api_url: "http://localhost:3000",
});
```

**Checks:**

- Unit tests pass
- Integration tests pass
- API responses match OpenAPI spec
- Database constraints enforced
- Error handling correct
- Performance acceptable

**Tools:**

- [Schemathesis](https://schemathesis.readthedocs.io/) - Property-based API testing
- [Dredd](https://dredd.org/) - HTTP API testing against spec
- [Prism](https://stoplight.io/open-source/prism) - Mock server validation

## Validation Orchestration Flow

```
┌─────────────────────────────────────────────┐
│  /specforge:validate                         │
└─────────────────┬───────────────────────────┘
                  │
    ┌─────────────┼─────────────┬──────────────┬───────────────┐
    ▼             ▼             ▼              ▼               ▼
┌────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐
│ Spec   │  │ Schema   │  │ Codegen  │  │ Compile  │  │ Runtime     │
│ Valid. │  │ Valid.   │  │ Valid.   │  │ Valid.   │  │ Valid.      │
└────┬───┘  └─────┬────┘  └─────┬────┘  └─────┬────┘  └──────┬──────┘
     │            │             │             │              │
     └────────────┴─────────────┴─────────────┴──────────────┘
                                 │
                                 ▼
                      ┌────────────────────┐
                      │ Validation Report  │
                      └────────────────────┘
```

## Implementation

### Step 1: Read Configuration

```bash
# Read CLAUDE.md to get tech stack configuration
cat CLAUDE.md | grep "SpecForge configuration" -A 10
```

Extract:

- Backend plugin
- Database plugin
- Codegen plugin
- Frontend plugin (if applicable)

### Step 2: Run Validation Levels Sequentially

Run each validation level and collect results:

```javascript
const results = {
  spec: { status: "pending", errors: [] },
  schema: { status: "pending", errors: [] },
  codegen: { status: "pending", errors: [] },
  compile: { status: "pending", errors: [] },
  runtime: { status: "pending", errors: [] },
};

// Level 1: Spec Validation
try {
  await validateSpec();
  results.spec.status = "passed";
} catch (error) {
  results.spec.status = "failed";
  results.spec.errors.push(error);
}

// Level 2: Schema Validation
try {
  await validateSchema();
  results.schema.status = "passed";
} catch (error) {
  results.schema.status = "failed";
  results.schema.errors.push(error);
}

// Continue for other levels...
```

### Step 3: Invoke Validation Agent for Deep Debugging

If any validation fails, invoke the validation agent (Sonnet) for deep debugging:

```javascript
if (
  results.spec.status === "failed" ||
  results.schema.status === "failed" ||
  results.codegen.status === "failed" ||
  results.compile.status === "failed" ||
  results.runtime.status === "failed"
) {
  await invokeAgent("validation-agent", {
    model: "sonnet",
    results: results,
    project_path: ".",
  });
}
```

### Step 4: Generate Validation Report

```markdown
# SpecForge Validation Report

## Summary

- ✓ Spec Validation: PASSED
- ✓ Schema Validation: PASSED
- ✗ Codegen Validation: FAILED
- - Compile Validation: SKIPPED
- - Runtime Validation: SKIPPED

## Details

### Codegen Validation Errors

1. **Missing generated type**: `Order` type not found in `src/generated/db/models.rs`

   - Expected: `pub struct Order { ... }`
   - Actual: File does not exist
   - Fix: Run `/specforge:build` to regenerate code

2. **Type mismatch**: `user_id` field type mismatch
   - Database schema: `INTEGER`
   - Generated type: `String`
   - Fix: Update sql-gen.toml type overrides

## Recommendations

1. Run code generation: `/specforge:build`
2. Fix type overrides in sql-gen.toml
3. Re-run validation: `/specforge:validate`
```

## Validation Modes

### Quick Validation (Default)

Run spec, schema, and compile validation (skip runtime tests):

```bash
/specforge:validate
```

### Full Validation (CI Mode)

Run all validation levels including runtime tests:

```bash
/specforge:validate --full
```

### Specific Level Validation

Run a specific validation level:

```bash
/specforge:validate --level spec
/specforge:validate --level schema
/specforge:validate --level codegen
/specforge:validate --level compile
/specforge:validate --level runtime
```

## Exit Codes

- `0`: All validations passed
- `1`: Spec validation failed
- `2`: Schema validation failed
- `3`: Codegen validation failed
- `4`: Compilation failed
- `5`: Runtime validation failed

## Integration with CI/CD

Example GitHub Actions workflow:

```yaml
name: SpecForge Validation

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install SpecForge
        run: |
          /plugin install specforge
          /plugin install specforge-backend-rust-axum
          /plugin install specforge-db-sqlite
          /plugin install specforge-generate-rust-sql

      - name: Run Full Validation
        run: /specforge:validate --full
```

## Validation Best Practices

1. **Run validation after every spec change**
2. **Fix validation errors before committing**
3. **Use validation in CI/CD pipeline**
4. **Review validation reports thoroughly**
5. **Keep specs and schemas in sync**

## Resources

- **Redocly CLI**: https://redocly.com/docs/cli/
- **Schemathesis**: https://schemathesis.readthedocs.io/
- **Dredd**: https://dredd.org/
- **OpenAPI Validation**: https://learn.openapis.org/validation.html

## Troubleshooting

### Common Validation Errors

#### Spec Validation Fails

```
Error: Missing required field 'description' for operation POST /users
```

**Fix**: Add description to OpenAPI spec:

```yaml
paths:
  /users:
    post:
      description: Create a new user
      # ...
```

#### Schema Validation Fails

```
Error: Migration 002 references non-existent table 'users'
```

**Fix**: Ensure migrations are sequential and applied in order.

#### Codegen Validation Fails

```
Error: Generated type 'User' does not match database schema
```

**Fix**: Re-run code generation with updated schema:

```bash
/specforge:build
```

#### Compilation Fails

```
Error: Type mismatch in handler - expected i64, found String
```

**Fix**: Update type overrides in codegen config or fix handler implementation.

#### Runtime Validation Fails

```
Error: API response does not match OpenAPI spec for GET /users/:id
Expected type: object
Actual type: array
```

**Fix**: Update handler implementation or OpenAPI spec to match.

---

**Validation ensures your SpecForge project maintains integrity across all layers - from specs to runtime.**
