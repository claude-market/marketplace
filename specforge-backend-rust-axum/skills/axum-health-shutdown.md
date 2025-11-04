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