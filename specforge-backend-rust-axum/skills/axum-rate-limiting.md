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