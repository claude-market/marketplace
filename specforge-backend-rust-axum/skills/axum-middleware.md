---
name: axum-middleware
description: Middleware patterns for Axum (CORS, logging, authentication)
keywords: [axum, middleware, cors, logging, auth]
---

# Axum Middleware Patterns

## CORS Middleware

```rust
use tower_http::cors::{CorsLayer, Any};
use axum::http::Method;

pub fn create_cors() -> CorsLayer {
    CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers(Any)
}

// In router
let app = Router::new()
    .route("/api/users", get(list_users))
    .layer(create_cors())
    .with_state(state);
```

## Request Logging Middleware

```rust
use tower_http::trace::{TraceLayer, DefaultMakeSpan, DefaultOnResponse};
use tracing::Level;

pub fn create_trace_layer() -> TraceLayer<tower_http::classify::SharedClassifier<tower_http::classify::ServerErrorsAsFailures>> {
    TraceLayer::new_for_http()
        .make_span_with(DefaultMakeSpan::new().level(Level::INFO))
        .on_response(DefaultOnResponse::new().level(Level::INFO))
}

// In router
let app = Router::new()
    .route("/api/users", get(list_users))
    .layer(create_trace_layer())
    .with_state(state);
```

## Custom Middleware

```rust
use axum::{
    body::Body,
    extract::Request,
    middleware::Next,
    response::Response,
};

pub async fn auth_middleware(
    req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let auth_header = req
        .headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok());

    match auth_header {
        Some(token) if token.starts_with("Bearer ") => {
            // Validate token
            let token = &token[7..];
            if validate_token(token).await {
                Ok(next.run(req).await)
            } else {
                Err(StatusCode::UNAUTHORIZED)
            }
        }
        _ => Err(StatusCode::UNAUTHORIZED),
    }
}

// Apply to specific routes
let protected = Router::new()
    .route("/api/users", post(create_user))
    .layer(axum::middleware::from_fn(auth_middleware));

let app = Router::new()
    .route("/health", get(health_check))
    .merge(protected)
    .with_state(state);
```

## Request ID Middleware

```rust
use axum::{
    body::Body,
    extract::Request,
    http::HeaderValue,
    middleware::Next,
    response::Response,
};
use uuid::Uuid;

pub async fn request_id_middleware(
    mut req: Request,
    next: Next,
) -> Response {
    let request_id = Uuid::new_v4().to_string();

    req.extensions_mut().insert(request_id.clone());

    let mut response = next.run(req).await;
    response.headers_mut().insert(
        "x-request-id",
        HeaderValue::from_str(&request_id).unwrap(),
    );

    response
}

// In router
let app = Router::new()
    .route("/api/users", get(list_users))
    .layer(axum::middleware::from_fn(request_id_middleware))
    .with_state(state);
```

## Combining Multiple Middleware

```rust
use tower::ServiceBuilder;

let app = Router::new()
    .route("/api/users", get(list_users))
    .layer(
        ServiceBuilder::new()
            .layer(create_trace_layer())
            .layer(axum::middleware::from_fn(request_id_middleware))
            .layer(create_cors())
    )
    .with_state(state);
```

## Conditional Middleware (Per-Route)

```rust
// Public routes
let public_routes = Router::new()
    .route("/health", get(health_check))
    .route("/api/auth/login", post(login));

// Protected routes
let protected_routes = Router::new()
    .route("/api/users", get(list_users).post(create_user))
    .route("/api/users/:id", get(get_user).put(update_user).delete(delete_user))
    .layer(axum::middleware::from_fn(auth_middleware));

// Combine
let app = Router::new()
    .merge(public_routes)
    .merge(protected_routes)
    .layer(create_trace_layer())
    .with_state(state);
```

## Rate Limiting Middleware

```rust
use tower_governor::{
    governor::GovernorConfigBuilder,
    key_extractor::SmartIpKeyExtractor,
    GovernorLayer,
};

pub fn create_rate_limiter() -> GovernorLayer<SmartIpKeyExtractor> {
    let governor_conf = Box::new(
        GovernorConfigBuilder::default()
            .per_second(10)
            .burst_size(20)
            .finish()
            .unwrap(),
    );

    GovernorLayer {
        config: Box::leak(governor_conf),
    }
}

// In router
let app = Router::new()
    .route("/api/users", get(list_users))
    .layer(create_rate_limiter())
    .with_state(state);
```