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
        .route("/api/users/{id}", get(get_user).put(update_user).delete(delete_user))
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