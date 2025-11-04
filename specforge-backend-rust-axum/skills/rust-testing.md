---
name: rust-testing
description: Testing patterns for Axum handlers using generated types
keywords: [rust, testing, axum, integration-tests]
---

# Rust Testing for Axum Handlers

Testing patterns using OpenAPI-generated and DB-generated types.

## Test Setup

```rust
// tests/common/mod.rs
use sqlx::SqlitePool;

pub async fn setup_test_db() -> SqlitePool {
    let pool = SqlitePool::connect(":memory:").await.unwrap();

    // Run migrations
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .unwrap();

    pool
}

pub fn setup_test_state(pool: SqlitePool) -> AppState {
    AppState { db: pool }
}
```

## Unit Testing Handlers

```rust
// tests/users_test.rs
use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use tower::ServiceExt;  // for `oneshot`

use crate::generated::api::{CreateUserRequest, User};

mod common;

#[tokio::test]
async fn test_create_user_success() {
    // Setup
    let db = common::setup_test_db().await;
    let state = common::setup_test_state(db);
    let app = create_router(state);

    // Create request
    let payload = CreateUserRequest {
        email: "test@example.com".to_string(),
        name: Some("Test User".to_string()),
    };

    let request = Request::builder()
        .uri("/api/users")
        .method("POST")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_string(&payload).unwrap()))
        .unwrap();

    // Execute
    let response = app.oneshot(request).await.unwrap();

    // Assert
    assert_eq!(response.status(), StatusCode::CREATED);

    let body = hyper::body::to_bytes(response.into_body()).await.unwrap();
    let user: User = serde_json::from_slice(&body).unwrap();

    assert_eq!(user.email, "test@example.com");
    assert_eq!(user.name.as_deref(), Some("Test User"));
}

#[tokio::test]
async fn test_create_user_duplicate_email() {
    // Setup
    let db = common::setup_test_db().await;
    let state = common::setup_test_state(db.clone());
    let app = create_router(state);

    // Create first user
    let payload = CreateUserRequest {
        email: "test@example.com".to_string(),
        name: Some("Test User".to_string()),
    };

    create_user(&db, &payload.email, payload.name.as_deref()).await.unwrap();

    // Try to create duplicate
    let request = Request::builder()
        .uri("/api/users")
        .method("POST")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_string(&payload).unwrap()))
        .unwrap();

    let response = app.oneshot(request).await.unwrap();

    // Assert
    assert_eq!(response.status(), StatusCode::CONFLICT);
}
```

## Testing with Test Fixtures

```rust
// tests/fixtures.rs
use crate::generated::db::create_user;

pub async fn create_test_user(db: &SqlitePool) -> User {
    create_user(db, "test@example.com", Some("Test User"))
        .await
        .unwrap()
}

pub async fn create_test_users(db: &SqlitePool, count: usize) -> Vec<User> {
    let mut users = Vec::new();
    for i in 0..count {
        let user = create_user(
            db,
            &format!("user{}@example.com", i),
            Some(&format!("User {}", i))
        )
        .await
        .unwrap();
        users.push(user);
    }
    users
}

// Use in tests
#[tokio::test]
async fn test_get_user() {
    let db = common::setup_test_db().await;
    let user = create_test_user(&db).await;

    // Test GET /api/users/:id
    // ...
}
```

## Testing Error Cases

```rust
#[tokio::test]
async fn test_get_nonexistent_user() {
    let db = common::setup_test_db().await;
    let state = common::setup_test_state(db);
    let app = create_router(state);

    let request = Request::builder()
        .uri("/api/users/99999")
        .method("GET")
        .body(Body::empty())
        .unwrap();

    let response = app.oneshot(request).await.unwrap();

    assert_eq!(response.status(), StatusCode::NOT_FOUND);

    let body = hyper::body::to_bytes(response.into_body()).await.unwrap();
    let error: ErrorResponse = serde_json::from_slice(&body).unwrap();

    assert_eq!(error.code, "NOT_FOUND");
}
```

## Integration Testing

```rust
// tests/integration_test.rs
#[tokio::test]
async fn test_user_crud_workflow() {
    let db = common::setup_test_db().await;
    let state = common::setup_test_state(db);
    let app = create_router(state);

    // 1. Create user
    let create_payload = CreateUserRequest {
        email: "workflow@example.com".to_string(),
        name: Some("Workflow User".to_string()),
    };

    let response = app
        .clone()
        .oneshot(create_user_request(&create_payload))
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::CREATED);
    let user: User = parse_response_body(response).await;

    // 2. Get user
    let response = app
        .clone()
        .oneshot(get_user_request(user.id))
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    // 3. Update user
    let update_payload = UpdateUserRequest {
        name: Some("Updated Name".to_string()),
    };

    let response = app
        .clone()
        .oneshot(update_user_request(user.id, &update_payload))
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    // 4. Delete user
    let response = app
        .oneshot(delete_user_request(user.id))
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::NO_CONTENT);
}
```