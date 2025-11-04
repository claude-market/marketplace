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