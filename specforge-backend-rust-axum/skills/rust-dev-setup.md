---
name: rust-dev-setup
description: Docker Compose setup for Rust + Axum backend
keywords: [rust, docker, setup, axum]
---

# Rust + Axum Development Setup

## Docker Compose Service

```yaml
services:
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ${PROJECT_NAME:-app}-api
    environment:
      DATABASE_URL: ${DATABASE_URL}
      RUST_LOG: ${RUST_LOG:-info}
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - cargo_cache:/usr/local/cargo/registry

volumes:
  cargo_cache:
```

## Dockerfile

```dockerfile
FROM rust:1.75-alpine AS builder
WORKDIR /app
RUN apk add --no-cache musl-dev openssl-dev
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release

FROM alpine:3.18
WORKDIR /app
RUN apk add --no-cache libgcc
COPY --from=builder /app/target/release/app /app/app
USER 1000
EXPOSE 3000
CMD ["./app"]
```

## Environment Variables

```bash
# .env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/app_dev
RUST_LOG=info,axum=debug
PORT=3000
```