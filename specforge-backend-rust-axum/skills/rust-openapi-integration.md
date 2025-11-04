---
name: rust-openapi-integration
description: Using OpenAPI-generated Rust types with openapi-generator
keywords: [rust, openapi, code-generation]
---

# Rust OpenAPI Integration

## OpenAPI Code Generation Tools

### `openapi-generator`

```bash
openapi-generator generate \
  -i spec/openapi.yaml \
  -g rust \
  -o backend/src/generated/api \
  --additional-properties=packageName=api
```

## Generated Structure

```
src/generated/api/
├── mod.rs
├── models.rs        # Request/response types
└── errors.rs        # Error schemas
```

## Using Generated Types

```rust
// Import generated types
use crate::generated::api::{
    CreateUserRequest,
    User,
    UserList,
    ListUsersQuery,
    ErrorResponse,
};

// Use in handler
pub async fn create_user(
    Json(payload): Json<CreateUserRequest>,
) -> Result<Json<User>, ErrorResponse> {
    // payload has all fields from OpenAPI schema
    // payload.email: String
    // payload.name: Option<String>
}
```

## Type Mapping

OpenAPI → Rust:

| OpenAPI Type | Rust Type |
|--------------|-----------|
| `string` | `String` |
| `integer` | `i64` or `i32` |
| `number` | `f64` |
| `boolean` | `bool` |
| `array` | `Vec<T>` |
| `object` | `struct` |
| nullable (`null` allowed) | `Option<T>` |

## Validation

Generated types include serde validation:

```rust
#[derive(Deserialize)]
pub struct CreateUserRequest {
    #[serde(validate = "email")]
    pub email: String,

    #[serde(validate = "length(min = 2, max = 100)")]
    pub name: String,
}
```