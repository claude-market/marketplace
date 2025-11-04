---
name: axum-error-mapping
description: Map database and framework errors to OpenAPI-generated error responses
keywords: [axum, errors, openapi, error-handling]
---

# Error Mapping in Axum

Map errors to OpenAPI-generated error schemas.

## Generated Error Schema

Your OpenAPI spec defines error schemas:

```yaml
components:
  schemas:
    ErrorResponse:
      type: object
      required: [error, code]
      properties:
        error:
          type: string
        code:
          type: string
        details:
          type: object
```

This generates:

```rust
// src/generated/api/errors.rs
#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
    pub code: String,
    pub details: Option<serde_json::Value>,
}
```

## Using Generated Error Schema

```rust
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use crate::generated::api::ErrorResponse;

impl ErrorResponse {
    pub fn not_found(message: &str) -> Self {
        Self {
            error: message.to_string(),
            code: "NOT_FOUND".to_string(),
            details: None,
        }
    }

    pub fn conflict(message: &str) -> Self {
        Self {
            error: message.to_string(),
            code: "CONFLICT".to_string(),
            details: None,
        }
    }

    pub fn bad_request(message: &str) -> Self {
        Self {
            error: message.to_string(),
            code: "BAD_REQUEST".to_string(),
            details: None,
        }
    }

    pub fn internal_error() -> Self {
        Self {
            error: "Internal server error".to_string(),
            code: "INTERNAL_ERROR".to_string(),
            details: None,
        }
    }
}

impl IntoResponse for ErrorResponse {
    fn into_response(self) -> Response {
        let status = match self.code.as_str() {
            "NOT_FOUND" => StatusCode::NOT_FOUND,
            "CONFLICT" => StatusCode::CONFLICT,
            "BAD_REQUEST" => StatusCode::BAD_REQUEST,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        };

        (status, Json(self)).into_response()
    }
}
```

## Mapping Database Errors

```rust
impl From<sqlx::Error> for ErrorResponse {
    fn from(err: sqlx::Error) -> Self {
        tracing::error!("Database error: {:?}", err);

        match err {
            sqlx::Error::RowNotFound => {
                ErrorResponse::not_found("Resource not found")
            }
            sqlx::Error::Database(db_err) => {
                if db_err.is_unique_violation() {
                    ErrorResponse::conflict("Resource already exists")
                } else {
                    ErrorResponse::internal_error()
                }
            }
            _ => ErrorResponse::internal_error(),
        }
    }
}
```

## Usage in Handlers

```rust
pub async fn get_user(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<User>, ErrorResponse> {
    let user = get_user_by_id(&state.db, id)
        .await?  // ← sqlx::Error automatically converted to ErrorResponse
        .ok_or_else(|| ErrorResponse::not_found("User not found"))?;

    Ok(Json(user))
}
```