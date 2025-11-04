# SpecForge Backend Plugin Implementation Guide

**Target Audience**: Expert Claude Code plugin developers
**Purpose**: Build backend framework expertise plugins that make Claude Code an expert in implementing API backends using OpenAPI-generated types

**Mental Model**: You're creating a **backend framework expert team member** who knows how to take OpenAPI-generated types and database-generated query functions and stitch them together using framework-specific patterns (Rust+Axum, Node+Express, Python+FastAPI, Go+Gin).

---

## Table of Contents

1. [Plugin Philosophy & Responsibilities](#plugin-philosophy--responsibilities)
2. [The Code Generation Flow](#the-code-generation-flow)
3. [Plugin Structure & Manifest](#plugin-structure--manifest)
4. [Required Skills (Knowledge Domains)](#required-skills-knowledge-domains)
5. [Distributed System Patterns](#distributed-system-patterns)
6. [Required Agents (Executable Workflows)](#required-agents-executable-workflows)
7. [Integration with SpecForge Core](#integration-with-specforge-core)
8. [Framework-Specific Examples](#framework-specific-examples)
9. [Reference Implementation: Rust + Axum](#reference-implementation-rust--axum)

---

## Plugin Philosophy & Responsibilities

### What is a Backend Plugin?

A backend plugin makes Claude Code an **expert in stitching together OpenAPI-generated types with database query functions** using framework-specific patterns.

**Critical Understanding**: The backend plugin does NOT define types. Types come from two sources:
1. **OpenAPI generator**: Request/response schemas, error schemas
2. **Codegen plugin**: Database models, query functions

The backend plugin teaches Claude how to:
- Use framework patterns (routing, middleware, extractors)
- Wire together generated types + generated DB functions
- Implement business logic between API and database layers
- Handle errors using generated error schemas
- Write tests using generated types
- Set up the runtime environment

### What Gets Generated (NOT by Backend Plugin)

```
OpenAPI Spec → OpenAPI Generator → Types
  ├─ CreateUserRequest (input schema)
  ├─ User (response schema)
  ├─ UserList (response schema)
  ├─ ErrorResponse (error schema)
  └─ ValidationError (error schema)

Database Schema → Codegen Plugin → DB Code
  ├─ create_user(db, email, name) → User
  ├─ get_user_by_id(db, id) → Option<User>
  ├─ list_users(db, page, per_page) → Vec<User>
  └─ delete_user(db, id) → ()
```

### What Backend Plugin Teaches

```rust
// Backend plugin teaches how to COMBINE generated code:

use crate::generated::api::{CreateUserRequest, User, ErrorResponse};  // ← OpenAPI generated
use crate::generated::db::{create_user, get_user_by_email};           // ← Codegen plugin generated

// Framework-specific pattern (what backend plugin teaches)
pub async fn create_user_handler(
    State(state): State<AppState>,        // ← Framework pattern
    Json(payload): Json<CreateUserRequest>,  // ← Using generated type
) -> Result<Json<User>, ErrorResponse> {     // ← Using generated types
    // Business logic (what backend plugin teaches)
    if get_user_by_email(&state.db, &payload.email).await?.is_some() {
        return Err(ErrorResponse::conflict("Email already exists"));
    }

    // Call generated DB function with generated request type
    let user = create_user(&state.db, &payload.email, &payload.name).await?;

    Ok(Json(user))  // ← Return generated response type
}
```

### Scope of Responsibility

✅ **Backend Plugin DOES**:
- Teach framework patterns (routing, middleware, extractors, state)
- Show how to use OpenAPI-generated types in handlers
- Show how to call database-generated functions
- Teach business logic patterns (validation, duplicate checks, transactions)
- Map framework errors to generated error schemas
- Provide testing patterns using generated types
- Provide Docker/deployment setup

❌ **Backend Plugin DOES NOT**:
- Define request/response types (OpenAPI generator does this)
- Define error types (OpenAPI generator does this)
- Generate database query code (codegen plugin does this)
- Design schemas (database plugin does this)

---

## The Code Generation Flow

Understanding the full flow is critical for backend plugin design:

```
┌─────────────────────────────────────────────────────┐
│ 1. OpenAPI Spec (spec/openapi.yaml)                │
│    - Endpoint definitions                           │
│    - Request/response schemas                       │
│    - Error schemas                                  │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 2. OpenAPI Generator (openapi-generator)            │
│    Generates:                                       │
│    - backend/src/generated/api/requests.rs          │
│    - backend/src/generated/api/responses.rs         │
│    - backend/src/generated/api/errors.rs            │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 3. Database Schema (migrations/*.sql)               │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 4. Codegen Plugin (rust-sql/ts-prisma/go-sqlc)     │
│    Generates:                                       │
│    - backend/src/generated/db/models.rs             │
│    - backend/src/generated/db/queries.rs            │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 5. Backend Plugin (rust-axum) ← YOU ARE HERE       │
│    Teaches how to implement:                        │
│    - backend/src/handlers/users.rs                  │
│    - backend/src/main.rs (router setup)             │
│    - backend/src/middleware/                        │
│    Using generated types from steps 2 & 4           │
└─────────────────────────────────────────────────────┘
```

---

## Plugin Structure & Manifest

### Directory Structure

```
specforge-backend-{tech}-{framework}/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── {framework}-patterns.md              # Framework patterns
│   ├── {framework}-handler-implementation.md # How to implement handlers
│   ├── {framework}-error-mapping.md         # Map errors to generated schemas
│   ├── {tech}-testing.md                    # Testing with generated types
│   ├── {framework}-middleware.md            # Middleware patterns
│   ├── {tech}-openapi-integration.md        # Using OpenAPI-generated types
│   └── {tech}-dev-setup.md                  # Docker setup ⭐ REQUIRED
├── agents/
│   ├── handler-implementer.md               # Implements handlers
│   ├── test-generator.md                    # Generates tests
│   └── router-builder.md                    # Wires up routes
├── templates/
│   ├── handler.template                     # Handler template
│   ├── main.template                        # App entry point
│   └── Dockerfile.template                  # Docker config
├── examples/
│   ├── simple-crud/                         # Complete example
│   └── complex-business-logic/
├── CODEOWNERS
├── README.md
└── LICENSE
```

### Naming Convention

```
specforge-backend-{technology}-{framework}
```

Examples:
- `specforge-backend-rust-axum`
- `specforge-backend-node-express`
- `specforge-backend-python-fastapi`
- `specforge-backend-go-gin`

### plugin.json Manifest

```json
{
  "name": "specforge-backend-rust-axum",
  "version": "1.0.0",
  "description": "Rust + Axum backend framework expertise - implements handlers using OpenAPI and DB-generated types",
  "author": {
    "name": "Your Name"
  },
  "license": "MIT",
  "keywords": [
    "specforge",
    "backend",
    "rust",
    "axum",
    "openapi"
  ],
  "skills": [
    "./skills/axum-patterns.md",
    "./skills/axum-handler-implementation.md",
    "./skills/axum-error-mapping.md",
    "./skills/rust-testing.md",
    "./skills/axum-middleware.md",
    "./skills/rust-openapi-integration.md",
    "./skills/rust-dev-setup.md"
  ],
  "agents": [
    "./agents/handler-implementer.md",
    "./agents/test-generator.md",
    "./agents/router-builder.md"
  ]
}
```

---

## Required Skills (Knowledge Domains)

### 1. Framework Patterns Skill ⭐ REQUIRED

**File**: `skills/{framework}-patterns.md`

**Purpose**: Core framework patterns - routing, extractors, state management

**Example**: `skills/axum-patterns.md`

```markdown
---
name: axum-patterns
description: Axum framework patterns for routing, extractors, and state management
keywords: [axum, rust, patterns, http]
---

# Axum Framework Patterns

Learn Axum patterns for implementing HTTP handlers.

## Router Setup

```rust
use axum::{
    routing::{get, post, delete, put},
    Router,
};

pub fn create_router(state: AppState) -> Router {
    Router::new()
        .route("/health", get(health_check))
        .route("/api/users", get(list_users).post(create_user))
        .route("/api/users/:id", get(get_user).put(update_user).delete(delete_user))
        .with_state(state)
}
```

## Extractors

Axum uses "extractors" to pull data from requests:

### State (Dependency Injection)

```rust
use axum::extract::State;

async fn handler(State(state): State<AppState>) -> Result<Json<Response>, ErrorResponse> {
    // Access shared state (database pool, config, etc.)
    let db = &state.db;
    // ...
}
```

### Path Parameters

```rust
use axum::extract::Path;

async fn get_user(
    Path(id): Path<i64>,
) -> Result<Json<User>, ErrorResponse> {
    // id extracted from /users/:id
}
```

### Query Parameters

```rust
use axum::extract::Query;

async fn list_users(
    Query(params): Query<ListUsersQuery>,  // ← Generated from OpenAPI
) -> Result<Json<UserList>, ErrorResponse> {
    // params.page, params.per_page extracted from ?page=1&per_page=20
}
```

### JSON Body

```rust
use axum::Json;

async fn create_user(
    Json(payload): Json<CreateUserRequest>,  // ← Generated from OpenAPI
) -> Result<Json<User>, ErrorResponse> {
    // payload is automatically deserialized
}
```

### Combining Extractors

**IMPORTANT**: Order matters!
- `State` and `Path` must come BEFORE `Json`/`Form`

```rust
async fn update_user(
    State(state): State<AppState>,
    Path(id): Path<i64>,
    Json(payload): Json<UpdateUserRequest>,
) -> Result<Json<User>, ErrorResponse> {
    // Correct order: State, Path, then Json
}
```

## Response Types

```rust
use axum::{http::StatusCode, Json};

// Simple JSON response
async fn handler() -> Json<User> {
    Json(user)
}

// With status code
async fn handler() -> (StatusCode, Json<User>) {
    (StatusCode::CREATED, Json(user))
}

// Error handling (using generated error type)
async fn handler() -> Result<Json<User>, ErrorResponse> {
    // ...
}
```

## State Management

```rust
#[derive(Clone)]
pub struct AppState {
    pub db: SqlitePool,
    pub config: Config,
}

// Pass to router
let app = create_router(state);
```
```

### 2. Handler Implementation Skill ⭐ REQUIRED

**File**: `skills/{framework}-handler-implementation.md`

**Purpose**: How to implement handler business logic using generated types

**Example**: `skills/axum-handler-implementation.md`

```markdown
---
name: axum-handler-implementation
description: Implement Axum handlers using OpenAPI-generated and DB-generated code
keywords: [axum, handlers, openapi, generated-types]
---

# Axum Handler Implementation

How to implement handlers that stitch together OpenAPI-generated types with DB-generated functions.

## Input: OpenAPI Route + Generated Paths

You will receive:
1. OpenAPI route definition
2. Path to OpenAPI-generated types: `src/generated/api/`
3. Path to DB-generated functions: `src/generated/db/`

## Handler Pattern

```rust
use axum::{extract::State, http::StatusCode, Json};

// Import generated API types
use crate::generated::api::{
    CreateUserRequest,    // ← From OpenAPI requestBody
    User,                 // ← From OpenAPI response
    ErrorResponse,        // ← From OpenAPI error schema
};

// Import generated DB functions
use crate::generated::db::{
    create_user as db_create_user,
    get_user_by_email,
};

use crate::state::AppState;

pub async fn create_user(
    State(state): State<AppState>,
    Json(payload): Json<CreateUserRequest>,  // ← Generated type
) -> Result<(StatusCode, Json<User>), ErrorResponse> {  // ← Generated types
    // 1. Business validation
    if get_user_by_email(&state.db, &payload.email).await?.is_some() {
        return Err(ErrorResponse::conflict("Email already exists"));
    }

    // 2. Call generated DB function
    let user = db_create_user(
        &state.db,
        &payload.email,
        &payload.name,
    )
    .await?;

    // 3. Return generated response type
    Ok((StatusCode::CREATED, Json(user)))
}
```

## Business Logic Patterns

### Duplicate Checks

```rust
// Check if resource exists before creating
if get_user_by_email(&state.db, &payload.email).await?.is_some() {
    return Err(ErrorResponse::conflict("Email already exists"));
}
```

### NOT NULL Validation

```rust
// Ensure required fields are present
let name = payload.name.ok_or_else(|| {
    ErrorResponse::bad_request("Name is required")
})?;
```

### Verify Resource Exists

```rust
// GET /users/:id - verify exists
let user = get_user_by_id(&state.db, id)
    .await?
    .ok_or_else(|| ErrorResponse::not_found("User not found"))?;
```

### Complex Queries

```rust
// Combine multiple DB calls
let user = get_user_by_id(&state.db, user_id).await?.ok_or(...)?;
let orders = list_orders_by_user(&state.db, user_id).await?;

// Combine into response
let response = UserWithOrders { user, orders };
Ok(Json(response))
```

### Transactions (if DB supports)

```rust
let mut tx = state.db.begin().await?;

let user = create_user_tx(&mut tx, email, name).await?;
create_user_role_tx(&mut tx, user.id, "user").await?;

tx.commit().await?;
```

## Pagination

```rust
use crate::generated::api::ListUsersQuery;  // ← Generated from OpenAPI

pub async fn list_users(
    State(state): State<AppState>,
    Query(query): Query<ListUsersQuery>,
) -> Result<Json<UserList>, ErrorResponse> {
    let page = query.page.unwrap_or(1);
    let per_page = query.per_page.unwrap_or(20).min(100);

    let users = list_users_paginated(&state.db, page, per_page).await?;

    Ok(Json(UserList { users }))
}
```

### 3. Error Mapping Skill ⭐ REQUIRED

**File**: `skills/{framework}-error-mapping.md`

**Purpose**: Map framework/database errors to OpenAPI-generated error schemas

**Example**: `skills/axum-error-mapping.md`

```markdown
---
name: axum-error-mapping
description: Map database and framework errors to OpenAPI-generated error responses
keywords: [axum, errors, openapi, error-handling]
---

# Error Mapping in Axum

Map errors to OpenAPI-generated error schemas.

## Generated Error Schema

Your OpenAPI spec defines error schemas:

```yaml
components:
  schemas:
    ErrorResponse:
      type: object
      required: [error, code]
      properties:
        error:
          type: string
        code:
          type: string
        details:
          type: object
```

This generates:

```rust
// src/generated/api/errors.rs
#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
    pub code: String,
    pub details: Option<serde_json::Value>,
}
```

## Using Generated Error Schema

```rust
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use crate::generated::api::ErrorResponse;

impl ErrorResponse {
    pub fn not_found(message: &str) -> Self {
        Self {
            error: message.to_string(),
            code: "NOT_FOUND".to_string(),
            details: None,
        }
    }

    pub fn conflict(message: &str) -> Self {
        Self {
            error: message.to_string(),
            code: "CONFLICT".to_string(),
            details: None,
        }
    }

    pub fn bad_request(message: &str) -> Self {
        Self {
            error: message.to_string(),
            code: "BAD_REQUEST".to_string(),
            details: None,
        }
    }

    pub fn internal_error() -> Self {
        Self {
            error: "Internal server error".to_string(),
            code: "INTERNAL_ERROR".to_string(),
            details: None,
        }
    }
}

impl IntoResponse for ErrorResponse {
    fn into_response(self) -> Response {
        let status = match self.code.as_str() {
            "NOT_FOUND" => StatusCode::NOT_FOUND,
            "CONFLICT" => StatusCode::CONFLICT,
            "BAD_REQUEST" => StatusCode::BAD_REQUEST,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        };

        (status, Json(self)).into_response()
    }
}
```

## Mapping Database Errors

```rust
impl From<sqlx::Error> for ErrorResponse {
    fn from(err: sqlx::Error) -> Self {
        tracing::error!("Database error: {:?}", err);

        match err {
            sqlx::Error::RowNotFound => {
                ErrorResponse::not_found("Resource not found")
            }
            sqlx::Error::Database(db_err) => {
                if db_err.is_unique_violation() {
                    ErrorResponse::conflict("Resource already exists")
                } else {
                    ErrorResponse::internal_error()
                }
            }
            _ => ErrorResponse::internal_error(),
        }
    }
}
```

## Usage in Handlers

```rust
pub async fn get_user(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<User>, ErrorResponse> {
    let user = get_user_by_id(&state.db, id)
        .await?  // ← sqlx::Error automatically converted to ErrorResponse
        .ok_or_else(|| ErrorResponse::not_found("User not found"))?;

    Ok(Json(user))
}
```

### 4. OpenAPI Integration Skill ⭐ REQUIRED

**File**: `skills/{tech}-openapi-integration.md`

**Purpose**: How to use OpenAPI-generated types, which generator to use

**Example**: `skills/rust-openapi-integration.md`

```markdown
---
name: rust-openapi-integration
description: Using OpenAPI-generated Rust types with utoipa or openapi-generator
keywords: [rust, openapi, code-generation, utoipa]
---

# Rust OpenAPI Integration

## OpenAPI Code Generation Tools

### `openapi-generator`

```bash
openapi-generator generate \
  -i spec/openapi.yaml \
  -g rust \
  -o backend/src/generated/api \
  --additional-properties=packageName=api
```

## Generated Structure

```
src/generated/api/
├── mod.rs
├── models.rs        # Request/response types
└── errors.rs        # Error schemas
```

## Using Generated Types

```rust
// Import generated types
use crate::generated::api::{
    CreateUserRequest,
    User,
    UserList,
    ListUsersQuery,
    ErrorResponse,
};

// Use in handler
pub async fn create_user(
    Json(payload): Json<CreateUserRequest>,
) -> Result<Json<User>, ErrorResponse> {
    // payload has all fields from OpenAPI schema
    // payload.email: String
    // payload.name: Option<String>
}
```

## Type Mapping

OpenAPI → Rust:

| OpenAPI Type | Rust Type |
|--------------|-----------|
| `string` | `String` |
| `integer` | `i64` or `i32` |
| `number` | `f64` |
| `boolean` | `bool` |
| `array` | `Vec<T>` |
| `object` | `struct` |
| nullable (`null` allowed) | `Option<T>` |

## Validation

Generated types include serde validation:

```rust
#[derive(Deserialize)]
pub struct CreateUserRequest {
    #[serde(validate = "email")]
    pub email: String,

    #[serde(validate = "length(min = 2, max = 100)")]
    pub name: String,
}
```

### 5. Testing Skill ⭐ REQUIRED

**File**: `skills/{tech}-testing.md`

**Purpose**: Testing handlers using generated types

### 6. Middleware Skill

**File**: `skills/{framework}-middleware.md`

**Purpose**: Middleware patterns (CORS, logging, auth)

### 7. Dev Setup Skill ⭐ REQUIRED

**File**: `skills/{tech}-dev-setup.md`

**Purpose**: Docker Compose configuration

```markdown
---
name: rust-dev-setup
description: Docker Compose setup for Rust + Axum backend
keywords: [rust, docker, setup, axum]
---

# Rust + Axum Development Setup

## Docker Compose Service

```yaml
services:
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ${PROJECT_NAME:-app}-api
    environment:
      DATABASE_URL: ${DATABASE_URL}
      RUST_LOG: ${RUST_LOG:-info}
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - cargo_cache:/usr/local/cargo/registry

volumes:
  cargo_cache:
```

## Dockerfile

```dockerfile
FROM rust:1.75-alpine AS builder
WORKDIR /app
RUN apk add --no-cache musl-dev openssl-dev
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release

FROM alpine:3.18
WORKDIR /app
RUN apk add --no-cache libgcc
COPY --from=builder /app/target/release/app /app/app
USER 1000
EXPOSE 3000
CMD ["./app"]
```

## Environment Variables

```bash
# .env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/app_dev
RUST_LOG=info,axum=debug
PORT=3000
```

---

## Distributed System Patterns

Modern distributed systems require specific patterns for reliability and resilience. Backend plugins MUST include skills for implementing these patterns in a framework-specific way.

**IMPORTANT**: Skills should contain ONLY implementation code, NO conceptual explanations. Show developers how to code it, not what it is.

### Required Distributed System Skills

Add these skills to your `skills/` directory:

#### 1. Idempotency Skill ⭐ REQUIRED

**File**: `skills/{framework}-idempotency.md`

**Purpose**: Framework-specific code for making handlers idempotent (safe to retry)

**Example**: `skills/axum-idempotency.md`

```markdown
---
name: axum-idempotency
description: Implement idempotent handlers in Axum using idempotency keys
keywords: [axum, idempotency, distributed-systems, retries]
---

# Idempotency in Axum

## Idempotency Key Header Extractor

```rust
use axum::{
    async_trait,
    extract::{FromRequestParts, TypedHeader},
    headers::{Header, HeaderName, HeaderValue},
    http::request::Parts,
};

static IDEMPOTENCY_KEY: HeaderName = HeaderName::from_static("idempotency-key");

pub struct IdempotencyKey(pub String);

#[async_trait]
impl<S> FromRequestParts<S> for IdempotencyKey
where
    S: Send + Sync,
{
    type Rejection = (StatusCode, String);

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        parts
            .headers
            .get(&IDEMPOTENCY_KEY)
            .and_then(|v| v.to_str().ok())
            .map(|s| IdempotencyKey(s.to_string()))
            .ok_or_else(|| {
                (
                    StatusCode::BAD_REQUEST,
                    "Missing Idempotency-Key header".to_string(),
                )
            })
    }
}
```

## Idempotency Store (Redis)

```rust
use redis::AsyncCommands;
use serde::{Deserialize, Serialize};
use std::time::Duration;

#[derive(Serialize, Deserialize, Clone)]
pub struct IdempotentResponse {
    pub status: u16,
    pub body: String,
}

pub async fn check_idempotency(
    redis: &mut redis::aio::Connection,
    key: &str,
) -> Result<Option<IdempotentResponse>, redis::RedisError> {
    redis.get(key).await
}

pub async fn store_idempotent_response(
    redis: &mut redis::aio::Connection,
    key: &str,
    response: &IdempotentResponse,
    ttl: Duration,
) -> Result<(), redis::RedisError> {
    redis
        .set_ex(key, serde_json::to_string(response).unwrap(), ttl.as_secs() as usize)
        .await
}
```

## Handler with Idempotency

```rust
use axum::{extract::State, http::StatusCode, Json};
use crate::generated::api::{CreateUserRequest, User, ErrorResponse};
use crate::generated::db::create_user;

pub async fn create_user_idempotent(
    State(state): State<AppState>,
    IdempotencyKey(key): IdempotencyKey,
    Json(payload): Json<CreateUserRequest>,
) -> Result<(StatusCode, Json<User>), ErrorResponse> {
    let mut redis = state.redis.get().await?;

    // Check if already processed
    if let Some(cached) = check_idempotency(&mut redis, &key).await? {
        let user: User = serde_json::from_str(&cached.body)?;
        return Ok((StatusCode::from_u16(cached.status).unwrap(), Json(user)));
    }

    // Process request
    let user = create_user(&state.db, &payload.email, &payload.name).await?;

    // Store result
    store_idempotent_response(
        &mut redis,
        &key,
        &IdempotentResponse {
            status: 201,
            body: serde_json::to_string(&user)?,
        },
        Duration::from_secs(86400), // 24h TTL
    )
    .await?;

    Ok((StatusCode::CREATED, Json(user)))
}
```

## AppState with Redis

```rust
#[derive(Clone)]
pub struct AppState {
    pub db: SqlitePool,
    pub redis: deadpool_redis::Pool,
}
```

#### 2. Retry and Circuit Breaker Skill ⭐ REQUIRED

**File**: `skills/{framework}-resilience.md`

**Purpose**: Retry logic with exponential backoff and circuit breakers

**Example**: `skills/axum-resilience.md`

```markdown
---
name: axum-resilience
description: Implement retries, exponential backoff, and circuit breakers in Axum
keywords: [axum, retry, circuit-breaker, resilience]
---

# Resilience Patterns in Axum

## Retry with Exponential Backoff

```rust
use tokio::time::{sleep, Duration};
use std::future::Future;

pub async fn retry_with_backoff<F, Fut, T, E>(
    mut f: F,
    max_retries: u32,
    initial_delay: Duration,
) -> Result<T, E>
where
    F: FnMut() -> Fut,
    Fut: Future<Output = Result<T, E>>,
{
    let mut delay = initial_delay;

    for attempt in 0..max_retries {
        match f().await {
            Ok(result) => return Ok(result),
            Err(e) if attempt == max_retries - 1 => return Err(e),
            Err(_) => {
                sleep(delay).await;
                delay *= 2; // Exponential backoff
            }
        }
    }

    unreachable!()
}
```

## Using Retry in Handler

```rust
pub async fn fetch_external_data(
    State(state): State<AppState>,
) -> Result<Json<ExternalData>, ErrorResponse> {
    let data = retry_with_backoff(
        || async {
            state
                .http_client
                .get("https://api.example.com/data")
                .send()
                .await?
                .json::<ExternalData>()
                .await
        },
        3,
        Duration::from_millis(100),
    )
    .await
    .map_err(|_| ErrorResponse::internal_error())?;

    Ok(Json(data))
}
```

## Circuit Breaker with `failsafe`

```toml
# Cargo.toml
[dependencies]
failsafe = "1.2"
```

```rust
use failsafe::{CircuitBreaker, Config as CircuitBreakerConfig};
use std::time::Duration;

pub fn create_circuit_breaker() -> CircuitBreaker {
    CircuitBreaker::new(
        CircuitBreakerConfig::default()
            .failure_threshold_capacity(5)
            .success_threshold_capacity(2)
            .timeout(Duration::from_secs(60)),
    )
}

// In AppState
#[derive(Clone)]
pub struct AppState {
    pub db: SqlitePool,
    pub external_api_cb: Arc<Mutex<CircuitBreaker>>,
}

// In handler
pub async fn call_external_api(
    State(state): State<AppState>,
) -> Result<Json<Data>, ErrorResponse> {
    let cb = state.external_api_cb.lock().await;

    let data = cb
        .call(|| async {
            state
                .http_client
                .get("https://api.example.com/data")
                .send()
                .await?
                .json::<Data>()
                .await
        })
        .await
        .map_err(|_| ErrorResponse::service_unavailable("External service down"))?;

    Ok(Json(data))
}
```

#### 3. Request Tracing Skill ⭐ REQUIRED

**File**: `skills/{framework}-tracing.md`

**Purpose**: Correlation IDs and distributed tracing

**Example**: `skills/axum-tracing.md`

```markdown
---
name: axum-tracing
description: Implement request tracing with correlation IDs in Axum
keywords: [axum, tracing, observability, correlation-id]
---

# Request Tracing in Axum

## Correlation ID Middleware

```rust
use axum::{
    body::Body,
    extract::Request,
    http::HeaderValue,
    middleware::Next,
    response::Response,
};
use uuid::Uuid;

pub static X_CORRELATION_ID: &str = "x-correlation-id";

pub async fn correlation_id_middleware(
    mut req: Request,
    next: Next,
) -> Response {
    let correlation_id = req
        .headers()
        .get(X_CORRELATION_ID)
        .and_then(|v| v.to_str().ok())
        .map(String::from)
        .unwrap_or_else(|| Uuid::new_v4().to_string());

    req.extensions_mut().insert(correlation_id.clone());

    let mut response = next.run(req).await;
    response.headers_mut().insert(
        X_CORRELATION_ID,
        HeaderValue::from_str(&correlation_id).unwrap(),
    );

    response
}
```

## Correlation ID Extractor

```rust
use axum::{
    async_trait,
    extract::FromRequestParts,
    http::request::Parts,
};

pub struct CorrelationId(pub String);

#[async_trait]
impl<S> FromRequestParts<S> for CorrelationId
where
    S: Send + Sync,
{
    type Rejection = (StatusCode, String);

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        parts
            .extensions
            .get::<String>()
            .cloned()
            .map(CorrelationId)
            .ok_or_else(|| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Missing correlation ID".to_string(),
                )
            })
    }
}
```

## Using Correlation ID in Handlers

```rust
pub async fn create_user_with_tracing(
    State(state): State<AppState>,
    CorrelationId(correlation_id): CorrelationId,
    Json(payload): Json<CreateUserRequest>,
) -> Result<(StatusCode, Json<User>), ErrorResponse> {
    tracing::info!(
        correlation_id = %correlation_id,
        email = %payload.email,
        "Creating user"
    );

    let user = create_user(&state.db, &payload.email, &payload.name).await?;

    tracing::info!(
        correlation_id = %correlation_id,
        user_id = %user.id,
        "User created successfully"
    );

    Ok((StatusCode::CREATED, Json(user)))
}
```

## Router with Middleware

```rust
use tower_http::trace::{TraceLayer, DefaultMakeSpan, DefaultOnResponse};

pub fn create_router(state: AppState) -> Router {
    Router::new()
        .route("/api/users", post(create_user_with_tracing))
        .layer(axum::middleware::from_fn(correlation_id_middleware))
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::new().include_headers(true))
                .on_response(DefaultOnResponse::new().include_headers(true))
        )
        .with_state(state)
}
```

#### 4. Timeouts Skill ⭐ REQUIRED

**File**: `skills/{framework}-timeouts.md`

**Purpose**: Request and operation timeouts

**Example**: `skills/axum-timeouts.md`

```markdown
---
name: axum-timeouts
description: Implement request and operation timeouts in Axum
keywords: [axum, timeout, resilience]
---

# Timeouts in Axum

## Request Timeout Middleware

```rust
use axum::{
    body::Body,
    extract::Request,
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
};
use std::time::Duration;
use tokio::time::timeout;

pub async fn timeout_middleware(
    req: Request,
    next: Next,
) -> Response {
    match timeout(Duration::from_secs(30), next.run(req)).await {
        Ok(response) => response,
        Err(_) => (
            StatusCode::REQUEST_TIMEOUT,
            "Request timed out after 30s",
        )
            .into_response(),
    }
}
```

## Operation-Level Timeout

```rust
use tokio::time::{timeout, Duration};

pub async fn fetch_with_timeout(
    State(state): State<AppState>,
) -> Result<Json<Data>, ErrorResponse> {
    let data = timeout(
        Duration::from_secs(5),
        async {
            state
                .http_client
                .get("https://api.example.com/data")
                .send()
                .await?
                .json::<Data>()
                .await
        }
    )
    .await
    .map_err(|_| ErrorResponse::gateway_timeout("External API timeout"))?
    .map_err(|_| ErrorResponse::internal_error())?;

    Ok(Json(data))
}
```

## Database Query Timeout

```rust
use sqlx::query_builder::Separated;

pub async fn get_user_with_timeout(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<User>, ErrorResponse> {
    let user = timeout(
        Duration::from_secs(10),
        get_user_by_id(&state.db, id)
    )
    .await
    .map_err(|_| ErrorResponse::gateway_timeout("Database query timeout"))?
    .map_err(|e| ErrorResponse::from(e))?
    .ok_or_else(|| ErrorResponse::not_found("User not found"))?;

    Ok(Json(user))
}
```

## Router with Timeout

```rust
pub fn create_router(state: AppState) -> Router {
    Router::new()
        .route("/api/users", get(list_users))
        .layer(axum::middleware::from_fn(timeout_middleware))
        .with_state(state)
}
```

#### 5. Health Checks and Graceful Shutdown Skill ⭐ REQUIRED

**File**: `skills/{framework}-health-shutdown.md`

**Purpose**: Health/readiness endpoints and graceful shutdown

**Example**: `skills/axum-health-shutdown.md`

```markdown
---
name: axum-health-shutdown
description: Implement health checks and graceful shutdown in Axum
keywords: [axum, health, readiness, graceful-shutdown]
---

# Health Checks and Graceful Shutdown

## Health Check Endpoints

```rust
use axum::{extract::State, http::StatusCode, Json};
use serde::Serialize;

#[derive(Serialize)]
pub struct HealthResponse {
    pub status: String,
}

#[derive(Serialize)]
pub struct ReadinessResponse {
    pub status: String,
    pub database: String,
    pub redis: String,
}

pub async fn health_check() -> (StatusCode, Json<HealthResponse>) {
    (
        StatusCode::OK,
        Json(HealthResponse {
            status: "ok".to_string(),
        }),
    )
}

pub async fn readiness_check(
    State(state): State<AppState>,
) -> (StatusCode, Json<ReadinessResponse>) {
    let db_status = match sqlx::query("SELECT 1").fetch_one(&state.db).await {
        Ok(_) => "ok",
        Err(_) => "error",
    };

    let mut redis_conn = state.redis.get().await;
    let redis_status = match redis_conn {
        Ok(ref mut conn) => match redis::cmd("PING").query_async::<_, String>(conn).await {
            Ok(_) => "ok",
            Err(_) => "error",
        },
        Err(_) => "error",
    };

    let overall_status = if db_status == "ok" && redis_status == "ok" {
        StatusCode::OK
    } else {
        StatusCode::SERVICE_UNAVAILABLE
    };

    (
        overall_status,
        Json(ReadinessResponse {
            status: if overall_status == StatusCode::OK {
                "ready".to_string()
            } else {
                "not ready".to_string()
            },
            database: db_status.to_string(),
            redis: redis_status.to_string(),
        }),
    )
}
```

## Graceful Shutdown

```rust
use tokio::signal;
use std::time::Duration;

#[tokio::main]
async fn main() {
    let state = AppState { /* ... */ };

    let app = create_router(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();

    tracing::info!("Server starting on :3000");

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .unwrap();

    tracing::info!("Server shut down gracefully");
}

async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("Failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("Failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {
            tracing::info!("Received Ctrl+C, starting graceful shutdown");
        },
        _ = terminate => {
            tracing::info!("Received SIGTERM, starting graceful shutdown");
        },
    }

    // Give in-flight requests time to complete
    tokio::time::sleep(Duration::from_secs(10)).await;
}
```

## Router with Health Endpoints

```rust
pub fn create_router(state: AppState) -> Router {
    Router::new()
        .route("/health", get(health_check))
        .route("/ready", get(readiness_check))
        .route("/api/users", get(list_users).post(create_user))
        .with_state(state)
}
```

#### 6. Rate Limiting Skill

**File**: `skills/{framework}-rate-limiting.md`

**Purpose**: Request rate limiting

**Example**: `skills/axum-rate-limiting.md`

```markdown
---
name: axum-rate-limiting
description: Implement rate limiting in Axum using tower-governor
keywords: [axum, rate-limiting, throttling]
---

# Rate Limiting in Axum

## Setup tower-governor

```toml
# Cargo.toml
[dependencies]
tower-governor = "0.1"
```

## Rate Limiter Configuration

```rust
use tower_governor::{
    governor::GovernorConfigBuilder, key_extractor::SmartIpKeyExtractor, GovernorLayer,
};
use std::time::Duration;

pub fn create_rate_limiter() -> GovernorLayer<SmartIpKeyExtractor> {
    let governor_conf = Box::new(
        GovernorConfigBuilder::default()
            .per_second(10) // 10 requests per second
            .burst_size(20) // Allow bursts of 20
            .finish()
            .unwrap(),
    );

    GovernorLayer {
        config: Box::leak(governor_conf),
    }
}
```

## Router with Rate Limiting

```rust
pub fn create_router(state: AppState) -> Router {
    Router::new()
        .route("/api/users", get(list_users).post(create_user))
        .layer(create_rate_limiter())
        .with_state(state)
}
```

## Custom Key Extractor (by User ID)

```rust
use tower_governor::key_extractor::KeyExtractor;

pub struct UserIdKeyExtractor;

impl KeyExtractor for UserIdKeyExtractor {
    type Key = String;

    fn extract<T>(&self, req: &axum::http::Request<T>) -> Result<Self::Key, tower_governor::GovernorError> {
        req.headers()
            .get("x-user-id")
            .and_then(|v| v.to_str().ok())
            .map(String::from)
            .ok_or(tower_governor::GovernorError::UnableToExtractKey)
    }
}

pub fn create_user_rate_limiter() -> GovernorLayer<UserIdKeyExtractor> {
    let governor_conf = Box::new(
        GovernorConfigBuilder::default()
            .per_minute(100) // 100 requests per minute per user
            .burst_size(20)
            .finish()
            .unwrap(),
    );

    GovernorLayer {
        config: Box::leak(governor_conf),
    }
}
```
```

### Updating Plugin Structure

Update your `skills/` directory structure to include:

```
skills/
├── {framework}-patterns.md
├── {framework}-handler-implementation.md
├── {framework}-error-mapping.md
├── {tech}-testing.md
├── {framework}-middleware.md
├── {tech}-openapi-integration.md
├── {tech}-dev-setup.md
├── {framework}-idempotency.md          # ⭐ NEW
├── {framework}-resilience.md           # ⭐ NEW
├── {framework}-tracing.md              # ⭐ NEW
├── {framework}-timeouts.md             # ⭐ NEW
├── {framework}-health-shutdown.md      # ⭐ NEW
└── {framework}-rate-limiting.md        # NEW (optional)
```

### Updating plugin.json

```json
{
  "name": "specforge-backend-rust-axum",
  "version": "1.0.0",
  "skills": [
    "./skills/axum-patterns.md",
    "./skills/axum-handler-implementation.md",
    "./skills/axum-error-mapping.md",
    "./skills/rust-testing.md",
    "./skills/axum-middleware.md",
    "./skills/rust-openapi-integration.md",
    "./skills/rust-dev-setup.md",
    "./skills/axum-idempotency.md",
    "./skills/axum-resilience.md",
    "./skills/axum-tracing.md",
    "./skills/axum-timeouts.md",
    "./skills/axum-health-shutdown.md",
    "./skills/axum-rate-limiting.md"
  ]
}
```

### AppState with All Dependencies

```rust
use sqlx::SqlitePool;
use deadpool_redis::Pool as RedisPool;
use std::sync::Arc;
use tokio::sync::Mutex;
use failsafe::CircuitBreaker;

#[derive(Clone)]
pub struct AppState {
    pub db: SqlitePool,
    pub redis: RedisPool,
    pub http_client: reqwest::Client,
    pub external_api_cb: Arc<Mutex<CircuitBreaker>>,
}

impl AppState {
    pub async fn new() -> Self {
        let db = SqlitePool::connect(&std::env::var("DATABASE_URL").unwrap())
            .await
            .unwrap();

        let redis_cfg = deadpool_redis::Config::from_url(
            &std::env::var("REDIS_URL").unwrap()
        );
        let redis = redis_cfg.create_pool(Some(deadpool_redis::Runtime::Tokio1)).unwrap();

        let http_client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .unwrap();

        Self {
            db,
            redis,
            http_client,
            external_api_cb: Arc::new(Mutex::new(create_circuit_breaker())),
        }
    }
}
```

---

## Required Agents (Executable Workflows)

### 1. Handler Implementer Agent ⭐ REQUIRED

**File**: `agents/handler-implementer.md`

**Model**: Haiku for simple CRUD, Sonnet for complex business logic

**Purpose**: Implement handlers using OpenAPI route definition + generated code paths

**Input Format**:

```json
{
  "task": "implement-handler",
  "endpoint": {
    "path": "/api/users",
    "method": "POST",
    "operationId": "createUser",
    "description": "Create a new user. Check for duplicate email before creating.",
    "requestBody": {
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/CreateUserRequest"
          }
        }
      }
    },
    "responses": {
      "201": {
        "description": "User created",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/User"
            }
          }
        }
      },
      "400": {
        "description": "Invalid input",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorResponse"
            }
          }
        }
      },
      "409": {
        "description": "Email already exists",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorResponse"
            }
          }
        }
      }
    }
  },
  "generated_api_types_path": "src/generated/api",
  "generated_db_functions_path": "src/generated/db",
  "output_path": "src/handlers/users.rs"
}
```

**Agent Implementation** (excerpt):

```markdown
---
name: handler-implementer
model: haiku
context_budget: 5000
description: Implements Axum handlers using OpenAPI definitions and generated code
---

# Handler Implementer Agent

You implement HTTP handlers by stitching together OpenAPI-generated types with DB-generated functions.

## Your Task

Given:
1. OpenAPI endpoint definition
2. Path to generated API types
3. Path to generated DB functions

Implement the handler function.

## Implementation Steps

1. **Determine imports**:
   ```rust
   // From OpenAPI generator
   use crate::generated::api::{
       CreateUserRequest,  // From requestBody schema
       User,               // From response schema
       ErrorResponse,      // From error schema
   };

   // From codegen plugin
   use crate::generated::db::{
       create_user,
       get_user_by_email,
   };
   ```

2. **Implement handler signature** (using framework patterns from skills):
   ```rust
   pub async fn create_user_handler(
       State(state): State<AppState>,
       Json(payload): Json<CreateUserRequest>,
   ) -> Result<(StatusCode, Json<User>), ErrorResponse>
   ```

3. **Implement business logic** (from OpenAPI description):
   - Parse description for business rules
   - "Check for duplicate email" → call get_user_by_email()
   - Return appropriate error responses (409 for conflict)

4. **Call DB functions**:
   ```rust
   let user = create_user(&state.db, &payload.email, &payload.name).await?;
   ```

5. **Return generated type**:
   ```rust
   Ok((StatusCode::CREATED, Json(user)))
   ```

## Example Output

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

    // Create user
    let user = create_user(&state.db, &payload.email, &payload.name).await?;

    Ok((StatusCode::CREATED, Json(user)))
}
```

## Access Skills

- `axum-patterns` - Framework patterns
- `axum-handler-implementation` - Business logic patterns
- `axum-error-mapping` - Error handling
```

**Output Format**:

```json
{
  "status": "completed",
  "handler_code": "...",
  "file_path": "src/handlers/users.rs",
  "imports": [
    "crate::generated::api::{CreateUserRequest, User, ErrorResponse}",
    "crate::generated::db::{create_user, get_user_by_email}"
  ],
  "function_name": "create_user_handler"
}
```

### 2. Test Generator Agent ⭐ REQUIRED

**File**: `agents/test-generator.md`

**Model**: Haiku

**Purpose**: Generate tests using generated types

**Input**:

```json
{
  "task": "generate-tests",
  "handler_path": "src/handlers/users.rs",
  "handler_name": "create_user_handler",
  "endpoint": {
    "path": "/api/users",
    "method": "POST",
    "requestBody": { "schema": {"$ref": "#/components/schemas/CreateUserRequest"} },
    "responses": {
      "201": { "description": "Success" },
      "409": { "description": "Duplicate email" }
    }
  },
  "generated_api_types_path": "src/generated/api"
}
```

**Output**:

```json
{
  "status": "completed",
  "test_file": "tests/users_test.rs",
  "tests_generated": [
    "test_create_user_success",
    "test_create_user_duplicate_email"
  ]
}
```

### 3. Router Builder Agent

**File**: `agents/router-builder.md`

**Model**: Haiku

**Purpose**: Wire up all handlers into router

**Input**:

```json
{
  "task": "build-router",
  "handlers": [
    {"path": "/api/users", "method": "GET", "handler": "list_users"},
    {"path": "/api/users", "method": "POST", "handler": "create_user"},
    {"path": "/api/users/:id", "method": "GET", "handler": "get_user"}
  ],
  "handler_modules": ["users", "orders"]
}
```

**Output**:

```rust
// src/main.rs
pub fn create_router(state: AppState) -> Router {
    Router::new()
        .route("/health", get(health_check))
        .route("/api/users", get(handlers::users::list_users).post(handlers::users::create_user))
        .route("/api/users/:id", get(handlers::users::get_user))
        .with_state(state)
}
```

---

## Integration with SpecForge Core

### How Core Orchestrates Backend Plugin

```javascript
// SpecForge /specforge:build command flow

// Phase 1: Apply database migrations (database plugin)
await applyMigrations();

// Phase 2: Code generation
// 2a. Generate OpenAPI types
await generateOpenAPITypes({
  spec: 'spec/openapi.yaml',
  output: 'backend/src/generated/api',
  generator: 'utoipa'  // From backend plugin metadata
});

// 2b. Generate DB code (codegen plugin)
await invokeAgent('specforge-generate-rust-sql/codegen-agent', {
  schema_dir: 'migrations/',
  output_dir: 'backend/src/generated/db'
});

// Phase 3: Handler implementation (backend plugin)
const endpoints = parseOpenAPISpec('spec/openapi.yaml');

const handlers = await Promise.all(
  endpoints.map(endpoint =>
    invokeAgent('specforge-backend-rust-axum/handler-implementer', {
      endpoint: endpoint,
      generated_api_types_path: 'backend/src/generated/api',
      generated_db_functions_path: 'backend/src/generated/db',
      output_path: `backend/src/handlers/${endpoint.tag}.rs`
    })
  )
);

// Phase 4: Wire up router
await invokeAgent('specforge-backend-rust-axum/router-builder', {
  handlers: handlers
});

// Phase 5: Generate tests
await invokeAgent('specforge-backend-rust-axum/test-generator', {
  handlers: handlers
});
```

---

## Framework-Specific Examples

### Rust + Axum

**Generated Code Paths**:
- OpenAPI types: `src/generated/api/` (utoipa or openapi-generator)
- DB functions: `src/generated/db/` (from rust-sql codegen plugin)

**Handler Pattern**:
```rust
use crate::generated::api::{CreateUserRequest, User, ErrorResponse};
use crate::generated::db::{create_user, get_user_by_email};

pub async fn create_user_handler(
    State(state): State<AppState>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<(StatusCode, Json<User>), ErrorResponse> {
    // ...
}
```

### Node + Express

**Generated Code Paths**:
- OpenAPI types: `src/generated/api/` (openapi-typescript or tsoa)
- DB functions: `src/generated/db/` (from ts-prisma codegen plugin)

**Handler Pattern**:
```typescript
import { CreateUserRequest, User, ErrorResponse } from '../generated/api';
import { createUser, getUserByEmail } from '../generated/db';

export async function createUserHandler(
  req: Request<{}, {}, CreateUserRequest>,
  res: Response<User | ErrorResponse>
) {
  // ...
}
```

### Python + FastAPI

**Generated Code Paths**:
- OpenAPI types: Types defined inline in FastAPI (no separate generation)
- DB functions: `app/generated/db/` (from python-sqlalchemy codegen)

**Handler Pattern**:
```python
from fastapi import APIRouter, HTTPException, Depends
from app.generated.db import create_user, get_user_by_email
from pydantic import BaseModel

# OpenAPI types auto-generated from Pydantic models
class CreateUserRequest(BaseModel):
    email: str
    name: str

@router.post("/users", response_model=User, status_code=201)
async def create_user_handler(
    payload: CreateUserRequest,
    db: Session = Depends(get_db)
):
    # ...
```

### Go + Gin

**Generated Code Paths**:
- OpenAPI types: `internal/generated/api/` (oapi-codegen)
- DB functions: `internal/generated/db/` (from go-sqlc codegen plugin)

**Handler Pattern**:
```go
import (
    "myapp/internal/generated/api"
    "myapp/internal/generated/db"
)

func CreateUserHandler(c *gin.Context) {
    var req api.CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, api.ErrorResponse{Error: "Invalid input"})
        return
    }

    // ...
}
```

---

## Reference Implementation: Rust + Axum

### Complete Handler Example

**`src/handlers/users.rs`**:

```rust
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};

// Generated API types from OpenAPI
use crate::generated::api::{
    CreateUserRequest,
    UpdateUserRequest,
    User,
    UserList,
    ListUsersQuery,
    ErrorResponse,
};

// Generated DB functions from codegen plugin
use crate::generated::db::{
    create_user,
    get_user_by_id,
    get_user_by_email,
    update_user,
    delete_user,
    list_users_paginated,
};

use crate::state::AppState;

/// POST /api/users
pub async fn create_user_handler(
    State(state): State<AppState>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<(StatusCode, Json<User>), ErrorResponse> {
    // Check for duplicate email
    if get_user_by_email(&state.db, &payload.email).await?.is_some() {
        return Err(ErrorResponse::conflict("Email already exists"));
    }

    // Create user using generated function
    let user = create_user(&state.db, &payload.email, &payload.name).await?;

    Ok((StatusCode::CREATED, Json(user)))
}

/// GET /api/users/:id
pub async fn get_user_handler(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<User>, ErrorResponse> {
    let user = get_user_by_id(&state.db, id)
        .await?
        .ok_or_else(|| ErrorResponse::not_found("User not found"))?;

    Ok(Json(user))
}

/// GET /api/users
pub async fn list_users_handler(
    State(state): State<AppState>,
    Query(query): Query<ListUsersQuery>,
) -> Result<Json<UserList>, ErrorResponse> {
    let page = query.page.unwrap_or(1);
    let per_page = query.per_page.unwrap_or(20).min(100);

    let users = list_users_paginated(&state.db, page, per_page).await?;

    Ok(Json(UserList { users }))
}

/// PUT /api/users/:id
pub async fn update_user_handler(
    State(state): State<AppState>,
    Path(id): Path<i64>,
    Json(payload): Json<UpdateUserRequest>,
) -> Result<Json<User>, ErrorResponse> {
    // Verify user exists
    get_user_by_id(&state.db, id)
        .await?
        .ok_or_else(|| ErrorResponse::not_found("User not found"))?;

    // Update using generated function
    let user = update_user(&state.db, id, payload.name.as_deref()).await?;

    Ok(Json(user))
}

/// DELETE /api/users/:id
pub async fn delete_user_handler(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<StatusCode, ErrorResponse> {
    // Verify user exists
    get_user_by_id(&state.db, id)
        .await?
        .ok_or_else(|| ErrorResponse::not_found("User not found"))?;

    delete_user(&state.db, id).await?;

    Ok(StatusCode::NO_CONTENT)
}
```

### Router Setup

**`src/main.rs`**:

```rust
use axum::{
    routing::{get, post, put, delete},
    Router,
};
use sqlx::SqlitePool;

mod handlers;
mod state;
mod generated;

use state::AppState;

#[tokio::main]
async fn main() {
    // Database connection
    let db = SqlitePool::connect(&std::env::var("DATABASE_URL").unwrap())
        .await
        .unwrap();

    // State
    let state = AppState { db };

    // Router
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/users", get(handlers::users::list_users_handler).post(handlers::users::create_user_handler))
        .route("/api/users/:id", get(handlers::users::get_user_handler).put(handlers::users::update_user_handler).delete(handlers::users::delete_user_handler))
        .with_state(state);

    // Server
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> &'static str {
    "OK"
}
```

---

## Best Practices Summary

1. **Use Generated Types**: ALL types come from OpenAPI or codegen plugins
2. **Framework Patterns**: Teach framework-specific idioms (extractors, middleware, etc.)
3. **Business Logic Focus**: Handlers implement business rules using generated functions
4. **Error Mapping**: Map framework/DB errors to generated error schemas
5. **Testing with Types**: Tests use same generated types as handlers
6. **Clear Separation**: Handler = glue between API layer and DB layer
7. **Documentation**: OpenAPI description guides implementation
8. **Type Safety**: Leverage compile-time guarantees from generated code

---

## Quick Start Checklist

- [ ] Choose technology + framework (rust-axum, node-express, python-fastapi, go-gin)
- [ ] Identify OpenAPI code generator for this tech
- [ ] Create `plugin.json` with `specforge` metadata
- [ ] Create required skills:
  - [ ] `{framework}-patterns.md` - Framework patterns
  - [ ] `{framework}-handler-implementation.md` - Using generated types
  - [ ] `{framework}-error-mapping.md` - Error handling
  - [ ] `{tech}-openapi-integration.md` - OpenAPI generator usage
  - [ ] `{tech}-testing.md` - Testing patterns
  - [ ] `{tech}-dev-setup.md` - Docker setup ⭐
  - [ ] `{framework}-idempotency.md` - Idempotent handlers
  - [ ] `{framework}-resilience.md` - Retries and circuit breakers
  - [ ] `{framework}-tracing.md` - Request tracing and correlation IDs
  - [ ] `{framework}-timeouts.md` - Request and operation timeouts
  - [ ] `{framework}-health-shutdown.md` - Health checks and graceful shutdown
  - [ ] `{framework}-rate-limiting.md` - Rate limiting (optional)
- [ ] Create required agents:
  - [ ] `handler-implementer.md` - Implements handlers from OpenAPI + generated paths
  - [ ] `test-generator.md` - Generates tests
  - [ ] `router-builder.md` - Wires up routes
- [ ] Create templates in `templates/`
- [ ] Add complete examples in `examples/`
- [ ] Test with compatible database/codegen plugins
- [ ] Submit with `/plugin-builder:publish`

---

**End of Backend Plugin Implementation Guide**