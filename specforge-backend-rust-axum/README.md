# SpecForge Backend: Rust + Axum

**Backend framework expertise plugin for SpecForge** - Makes Claude Code an expert in implementing API backends using Rust, Axum, OpenAPI-generated types, and database-generated query functions.

## Overview

This plugin teaches Claude Code how to:
- Build production-ready REST APIs with Rust and Axum
- Stitch together OpenAPI-generated types with database-generated query functions
- Implement framework-specific patterns (routing, middleware, extractors, state)
- Apply distributed systems patterns (idempotency, retries, circuit breakers, tracing)
- Write comprehensive tests using generated types
- Set up Docker-based development environments

## What Gets Generated

The plugin works with code generated from two sources:

1. **OpenAPI Generator** → Request/Response types (`src/generated/api/`)
2. **Database Codegen Plugin** → Query functions (`src/generated/db/`)

The backend plugin teaches how to **combine** these generated pieces using Axum framework patterns.

## Installation

```bash
/plugin install ./specforge-backend-rust-axum
```

## Skills Included

### Core Framework Skills (7)

1. **axum-patterns** - Router setup, extractors, state management
2. **axum-handler-implementation** - Business logic patterns for handlers
3. **axum-error-mapping** - Map errors to OpenAPI schemas
4. **rust-testing** - Test patterns using generated types
5. **axum-middleware** - CORS, logging, auth middleware
6. **rust-openapi-integration** - Using OpenAPI generators
7. **rust-dev-setup** - Docker Compose configuration

### Distributed System Skills (6)

8. **axum-idempotency** - Idempotent handlers with Redis
9. **axum-resilience** - Retries with exponential backoff and circuit breakers
10. **axum-tracing** - Request tracing with correlation IDs
11. **axum-timeouts** - Request and operation timeouts
12. **axum-health-shutdown** - Health checks and graceful shutdown
13. **axum-rate-limiting** - Rate limiting with tower-governor

## Agents Included

### 1. Handler Implementer

Implements HTTP handlers by combining OpenAPI-generated types with DB-generated functions.

**Input:**
- OpenAPI endpoint definition
- Path to generated API types
- Path to generated DB functions

**Output:**
- Complete handler implementation with business logic

**Model:** Haiku (fast and efficient for CRUD handlers)

### 2. Test Generator

Generates comprehensive test suites for handlers using generated types.

**Input:**
- Handler path and function name
- Endpoint definition
- Path to generated API types

**Output:**
- Complete test suite with success and error cases

**Model:** Haiku

### 3. Router Builder

Wires up all handlers into an Axum router with middleware.

**Input:**
- List of handlers with paths, methods, and handler names
- Handler module names

**Output:**
- Complete router configuration with middleware

**Model:** Haiku

## Example Usage

### Creating a User Handler

Given this OpenAPI endpoint:

```yaml
paths:
  /api/users:
    post:
      operationId: createUser
      description: Create a new user. Check for duplicate email before creating.
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '201':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```

The handler-implementer agent generates:

```rust
use axum::{extract::State, http::StatusCode, Json};
use crate::{
    generated::api::{CreateUserRequest, User, ErrorResponse},
    generated::db::{create_user, get_user_by_email},
    state::AppState,
};

pub async fn create_user_handler(
    State(state): State<AppState>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<(StatusCode, Json<User>), ErrorResponse> {
    // Business logic: Check for duplicate email
    if get_user_by_email(&state.db, &payload.email).await?.is_some() {
        return Err(ErrorResponse::conflict("Email already exists"));
    }

    // Create user using DB-generated function
    let user = create_user(&state.db, &payload.email, &payload.name).await?;

    Ok((StatusCode::CREATED, Json(user)))
}
```

## Integration with SpecForge

This plugin is part of the SpecForge ecosystem:

1. **SpecForge Database Plugin** → Manages database schema and migrations
2. **SpecForge Codegen Plugin** → Generates DB query functions
3. **SpecForge Backend Plugin** (this plugin) → Implements API handlers
4. **SpecForge Client Plugin** → Generates frontend API clients

## Requirements

- Rust 1.75+
- Axum 0.7+
- SQLx or compatible database driver
- OpenAPI 3.0+ specification

## Philosophy

**The backend plugin does NOT define types.** Types come from:
- OpenAPI generator (request/response schemas)
- Codegen plugin (database models, query functions)

The backend plugin teaches how to:
- Use framework patterns (routing, middleware, extractors)
- Wire together generated types + generated DB functions
- Implement business logic between API and database layers
- Handle errors using generated error schemas
- Write tests using generated types

## Next Steps

1. Install the plugin: `/plugin install ./specforge-backend-rust-axum`
2. Use with SpecForge database and codegen plugins
3. Invoke agents to implement handlers from your OpenAPI spec

## License

MIT License - See [LICENSE](./LICENSE) file for details

## Author

Daniel Emod Kovacs (@danielkov)

## Contributing

Contributions welcome! Please ensure:
- All skills follow the implementation-only pattern (code, not concepts)
- Agents use appropriate models (Haiku for simple tasks, Sonnet for complex)
- Examples use OpenAPI-generated and DB-generated types
- Code follows Rust and Axum best practices