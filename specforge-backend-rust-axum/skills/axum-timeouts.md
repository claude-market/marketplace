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