---
name: ship
description: Deployment preparation - build production artifacts, run security checks, and generate deployment configs
---

# SpecForge Ship Command

Prepare your SpecForge project for deployment by building production artifacts, running security checks, optimizing Docker images, and generating deployment configurations.

## Overview

The ship command orchestrates the final steps before deployment:

1. **Pre-deployment Validation** - Ensure everything passes validation and tests
2. **Production Build** - Build optimized production artifacts
3. **Security Scanning** - Scan for vulnerabilities
4. **Docker Optimization** - Build optimized production Docker images
5. **Deployment Config Generation** - Generate deployment manifests
6. **Deployment Readiness Report** - Final checklist and next steps

## Ship Orchestration Flow

```
┌─────────────────────────────────────────────┐
│  /specforge:ship                             │
└─────────────────┬───────────────────────────┘
                  │
    ┌─────────────┼─────────────┬──────────────┬───────────────┐
    ▼             ▼             ▼              ▼               ▼
┌────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐
│ Pre-   │  │ Build    │  │ Security │  │ Docker   │  │ Deploy      │
│ flight │  │ Prod     │  │ Scan     │  │ Optimize │  │ Config      │
└────┬───┘  └─────┬────┘  └─────┬────┘  └─────┬────┘  └──────┬──────┘
     │            │             │             │              │
     └────────────┴─────────────┴─────────────┴──────────────┘
                                 │
                                 ▼
                      ┌────────────────────┐
                      │ Readiness Report   │
                      └────────────────────┘
```

## Step 1: Pre-deployment Validation

Run full validation and tests to ensure everything is ready:

```bash
# Run validation
/specforge:validate --full

# Run full test suite
/specforge:test --full
```

If validation or tests fail, abort the ship process and report errors to the user.

**Checks:**

- ✓ All validation levels pass (spec, schema, codegen, compile, runtime)
- ✓ All tests pass (unit, integration, contract)
- ✓ No pending migrations
- ✓ No uncommitted changes (warn if dirty git status)
- ✓ Version is tagged (recommend if not)

## Step 2: Production Build

Build optimized production artifacts using backend plugin:

```bash
# Read backend plugin from CLAUDE.md
BACKEND_PLUGIN=$(grep "backend:" CLAUDE.md | cut -d: -f2 | tr -d ' ')
```

Invoke backend plugin's production build:

```
Use {backend-plugin}/docker-expert skill with:
- action: "build-production"
- project_path: "backend/"
- optimization: "release"
- output_path: "dist/"
```

**Technology-Specific Builds:**

**Rust:**

```bash
cd backend && cargo build --release
strip target/release/api  # Strip debug symbols
```

**TypeScript/Node:**

```bash
cd backend && npm run build
npm prune --production  # Remove dev dependencies
```

**Python:**

```bash
cd backend && pip install --no-dev
python -m compileall .  # Compile to bytecode
```

**Go:**

```bash
cd backend && CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-s -w' -o dist/api
```

**Optimization Checks:**

- ✓ Debug symbols removed
- ✓ Dev dependencies excluded
- ✓ Build artifacts optimized
- ✓ Static files bundled
- ✓ Environment variables externalized

## Step 3: Security Scanning

Run security scans on dependencies and container images:

### Dependency Scanning

Scan project dependencies for known vulnerabilities:

**Rust:**

```bash
cargo audit
```

**Node/TypeScript:**

```bash
npm audit --production
# Or use snyk
npx snyk test
```

**Python:**

```bash
pip-audit
# Or use safety
safety check
```

**Go:**

```bash
go list -json -m all | nancy sleuth
```

### Container Image Scanning

Use [Trivy](https://aquasecurity.github.io/trivy/) to scan Docker images:

```bash
# Build production image first
docker build -t my-api:latest -f backend/Dockerfile.prod backend/

# Scan for vulnerabilities
trivy image --severity HIGH,CRITICAL my-api:latest

# Scan for misconfigurations
trivy config docker/docker-compose.yml
```

**Security Checks:**

- ✓ No critical vulnerabilities in dependencies
- ✓ No high-severity CVEs in base images
- ✓ No secrets in Docker images
- ✓ Non-root user in containers
- ✓ Minimal base image used
- ✓ No unnecessary packages

If critical vulnerabilities found, report and recommend fixes:

```
⚠ Security Issues Found:

1. Critical: CVE-2024-1234 in openssl 1.1.1
   Fix: Update Dockerfile to use openssl 3.0

2. High: Secrets detected in .env file
   Fix: Remove .env from Docker context, use environment variables

Run `trivy image --severity CRITICAL my-api:latest` for details.
```

## Step 4: Docker Optimization

Build optimized multi-stage Docker images:

```
Use {backend-plugin}/docker-expert skill with:
- action: "build-optimized-image"
- dockerfile: "backend/Dockerfile.prod"
- image_tag: "{project-name}:{version}"
- optimization: "multi-stage"
```

**Optimized Dockerfile Pattern (Rust Example):**

```dockerfile
# Stage 1: Build
FROM rust:1.75 AS builder
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release
RUN strip target/release/api

# Stage 2: Runtime
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1000 app
USER app
WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/target/release/api ./

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000
CMD ["./api"]
```

**Optimization Metrics:**

- Image size reduction (target: <100MB for compiled languages)
- Build time
- Layer caching efficiency
- Security score (no vulnerabilities)

### Database Docker Optimization

Prepare production database configuration:

```
Use {database-plugin}/docker-expert skill with:
- action: "build-production-config"
- compose_file: "docker/docker-compose.prod.yml"
```

**Production Database Config (PostgreSQL Example):**

```yaml
version: "3.8"

services:
  db:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    secrets:
      - db_password
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend

  api:
    image: my-api:${VERSION:-latest}
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      RUST_LOG: info
    ports:
      - "3000:3000"
    networks:
      - backend
      - frontend

secrets:
  db_password:
    external: true

volumes:
  postgres-data:

networks:
  backend:
  frontend:
```

## Step 5: Deployment Configuration Generation

Generate deployment manifests for various platforms:

### Ask User for Deployment Target

Use AskUserQuestion to ask where they're deploying:

- **Docker Compose** - Simple VPS deployment
- **Kubernetes** - Scalable cloud deployment
- **AWS ECS/Fargate** - Managed containers on AWS
- **Google Cloud Run** - Serverless containers on GCP
- **Azure Container Instances** - Containers on Azure
- **Fly.io** - Edge deployment platform
- **Railway** - Simple cloud platform

### Generate Platform-Specific Configs

#### Docker Compose (VPS Deployment)

```yaml
# docker-compose.prod.yml
version: "3.8"

services:
  db:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      interval: 10s

  api:
    image: ${REGISTRY_URL}/my-api:${VERSION}
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
    ports:
      - "80:3000"

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
```

#### Kubernetes Deployment

Generate Kubernetes manifests:

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  labels:
    app: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: ${REGISTRY_URL}/my-api:${VERSION}
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: url
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "512Mi"
              cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector:
    app: api
  ports:
    - port: 80
      targetPort: 3000
  type: LoadBalancer
```

#### AWS ECS Task Definition

```json
{
  "family": "my-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "${REGISTRY_URL}/my-api:${VERSION}",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "${DATABASE_URL}"
        }
      ],
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:3000/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/my-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Fly.io Configuration

```toml
# fly.toml
app = "my-api"
primary_region = "iad"

[build]
  image = "${REGISTRY_URL}/my-api:${VERSION}"

[env]
  PORT = "3000"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[http_service.checks]]
  interval = "10s"
  timeout = "2s"
  grace_period = "5s"
  method = "GET"
  path = "/health"
```

### Generate Environment Variable Template

Create `.env.production.example`:

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@db:5432/dbname

# API Configuration
API_PORT=3000
RUST_LOG=info

# Security
JWT_SECRET=<generate-secure-secret>
API_KEY=<generate-api-key>

# External Services (if needed)
REDIS_URL=redis://redis:6379
S3_BUCKET=my-bucket
AWS_REGION=us-east-1

# Monitoring (optional)
SENTRY_DSN=<your-sentry-dsn>
```

## Step 6: Generate Deployment Readiness Report

Create a comprehensive readiness report:

````markdown
# Deployment Readiness Report

**Project**: my-api
**Version**: 1.0.0
**Date**: 2025-01-15
**Target**: Production

---

## ✓ Pre-flight Checks

- ✓ All validation levels passed
- ✓ All tests passed (65/65)
- ✓ No pending migrations
- ✓ Git tag: v1.0.0
- ✓ No uncommitted changes

## ✓ Production Build

- ✓ Backend built (release mode)
- ✓ Binary size: 12.5 MB
- ✓ Build time: 2m 34s
- ✓ Static files bundled
- ✓ Dependencies optimized

## ✓ Security Scan

- ✓ No critical vulnerabilities
- ✓ No high-severity CVEs
- ✓ Container scan passed
- ⚠ 1 medium-severity issue (non-blocking)
  - Update recommended: rust 1.75 → 1.76

## ✓ Docker Images

**Backend Image**: my-api:1.0.0

- Base: debian:bookworm-slim
- Size: 45 MB (reduced from 850 MB)
- Layers: 8
- Non-root user: ✓
- Health check: ✓
- Security scan: PASS

**Database Image**: postgres:15-alpine

- Size: 238 MB
- Security scan: PASS

## ✓ Deployment Configuration

Generated configs for:

- ✓ Docker Compose (docker-compose.prod.yml)
- ✓ Kubernetes (k8s/\*.yaml)
- ✓ Environment variables (.env.production.example)

## Next Steps

### 1. Push Docker Images

```bash
# Tag image
docker tag my-api:1.0.0 ${REGISTRY_URL}/my-api:1.0.0
docker tag my-api:1.0.0 ${REGISTRY_URL}/my-api:latest

# Push to registry
docker push ${REGISTRY_URL}/my-api:1.0.0
docker push ${REGISTRY_URL}/my-api:latest
```
````

### 2. Set Environment Variables

Copy `.env.production.example` to `.env.production` and fill in:

- Database credentials
- JWT secret (generate with: `openssl rand -base64 32`)
- API keys
- External service credentials

### 3. Deploy

**Docker Compose (VPS):**

```bash
# Copy files to server
scp docker-compose.prod.yml .env.production user@server:/app/

# SSH to server
ssh user@server

# Start services
cd /app
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose exec api ./api migrate

# Check health
curl https://your-domain.com/health
```

**Kubernetes:**

```bash
# Apply manifests
kubectl apply -f k8s/

# Check deployment
kubectl rollout status deployment/api

# Check pods
kubectl get pods

# Check logs
kubectl logs -f deployment/api
```

### 4. Post-Deployment Verification

- [ ] Health check endpoint responds: `curl https://your-domain.com/health`
- [ ] API endpoints respond correctly
- [ ] Database migrations applied
- [ ] Monitoring/logging configured
- [ ] SSL/TLS certificates valid
- [ ] DNS configured correctly

### 5. Monitoring & Observability (Recommended)

Set up monitoring:

- [ ] Health check monitoring (UptimeRobot, Pingdom)
- [ ] Error tracking (Sentry, Rollbar)
- [ ] Performance monitoring (New Relic, DataDog)
- [ ] Log aggregation (CloudWatch, Papertrail)
- [ ] Metrics (Prometheus + Grafana)

## Rollback Plan

If deployment fails:

```bash
# Docker Compose
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d my-api:0.9.0

# Kubernetes
kubectl rollout undo deployment/api
```

## Support

- **Documentation**: https://github.com/your-org/my-api
- **Issues**: https://github.com/your-org/my-api/issues
- **OpenAPI Spec**: https://your-domain.com/api/docs

---

**Status**: ✅ READY TO SHIP

All checks passed. Your application is ready for production deployment!

```

## Ship Summary

Display concise summary to user:

```

✅ Ship Complete!

Pre-flight: ✓ All checks passed
Build: ✓ Optimized production artifacts
Security: ✓ No critical vulnerabilities
Docker: ✓ Images built and optimized (45 MB)
Deploy: ✓ Configs generated

📦 Docker Image: my-api:1.0.0 (45 MB)
📝 Deployment configs generated in ./deploy/

Next Steps:

1. Push images: docker push ${REGISTRY_URL}/my-api:1.0.0
2. Configure environment: cp .env.production.example .env.production
3. Deploy: docker-compose -f docker-compose.prod.yml up -d
4. Verify: curl https://your-domain.com/health

Full report: ./deploy/DEPLOYMENT_REPORT.md

```

## Error Handling

### Pre-flight Validation Fails

If validation or tests fail, abort ship and show errors:

```

❌ Ship Aborted

Pre-flight validation failed:

Tests: ✗ 3 tests failing

- test_create_order_validation
- test_get_user_not_found
- test_pagination

Fix these issues and run /specforge:ship again.

Run /specforge:test for details.

```

### Security Vulnerabilities Found

If critical vulnerabilities found, warn and recommend fixes:

```

⚠️ Critical Security Issues Found

2 critical vulnerabilities detected:

1. CVE-2024-1234 in openssl 1.1.1 (CRITICAL)
   Fix: Update base image to use openssl 3.0

2. Secrets detected in Docker image (HIGH)
   Fix: Remove .env from Docker context

Recommendation: Fix these issues before deploying to production.

Continue anyway? (not recommended)

```

### Build Failures

If production build fails:

```

❌ Production Build Failed

Error: Compilation failed in release mode
--> src/handlers/orders.rs:45:12
|
45 | let total = order.items.sum();
| ^^^^^^ method not found

Fix the compilation error and run /specforge:ship again.

````

## Platform-Specific Guidance

Provide additional guidance based on deployment target:

### Docker Compose (VPS)

```markdown
## VPS Deployment Guide

1. **Provision a VPS** (DigitalOcean, Linode, Vultr)
   - Recommended: 2 vCPU, 4GB RAM, 50GB SSD
   - OS: Ubuntu 22.04 LTS

2. **Install Docker & Docker Compose**
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
````

3. **Set up reverse proxy (Nginx)**

   - SSL with Let's Encrypt (Certbot)
   - Rate limiting
   - Gzip compression

4. **Configure firewall**
   ```bash
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

````

### Kubernetes

```markdown
## Kubernetes Deployment Guide

1. **Set up cluster** (EKS, GKE, AKS, or self-hosted)

2. **Configure kubectl**
   ```bash
   kubectl config use-context my-cluster
````

3. **Create namespace**

   ```bash
   kubectl create namespace my-api
   ```

4. **Create secrets**

   ```bash
   kubectl create secret generic db-credentials \
     --from-literal=url='postgresql://...' \
     -n my-api
   ```

5. **Apply manifests**

   ```bash
   kubectl apply -f k8s/ -n my-api
   ```

6. **Set up ingress** (Nginx Ingress, Traefik, or cloud load balancer)

````

## Cleanup

Optionally clean up development artifacts:

```bash
# Remove development containers
docker-compose down -v

# Clean build artifacts
cd backend && cargo clean

# Remove node_modules (if applicable)
rm -rf node_modules

# Prune Docker system
docker system prune -af
````

## Resources

- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/
- **Kubernetes Best Practices**: https://kubernetes.io/docs/concepts/configuration/overview/
- **Trivy Security Scanner**: https://aquasecurity.github.io/trivy/
- **Container Security**: https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html
- **Zero-Downtime Deployments**: https://martinfowler.com/bliki/BlueGreenDeployment.html

---

**The ship command ensures your SpecForge project is production-ready, secure, and optimized for deployment.**
