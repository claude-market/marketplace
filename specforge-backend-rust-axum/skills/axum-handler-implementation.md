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