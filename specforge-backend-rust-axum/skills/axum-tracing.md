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
    extract::FromRequestParts,
    http::request::Parts,
};

pub struct CorrelationId(pub String);

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