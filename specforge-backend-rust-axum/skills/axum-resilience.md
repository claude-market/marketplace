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