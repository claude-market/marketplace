---
name: init
description: Initialize a SpecForge project with tech stack selection
---

# SpecForge Initialization

Initialize a new SpecForge project by selecting your tech stack and configuring the development environment.

## Overview

SpecForge uses a **three-plugin architecture**:

1. **Backend Plugin** - Framework patterns and handlers
2. **Database Plugin** - Database tooling and migrations
3. **Codegen Pipeline Plugin** - Type-safe code generation bridging backend + database

This initialization command will guide you through selecting compatible plugins for your stack.

## Step 1: Discover Available Tech Stack Options

Search the Claude Market marketplace for available SpecForge plugins:

```bash
curl -s https://api.github.com/repos/claude-market/marketplace/contents/ | jq -r '.[] | select(.type == "dir" and (.name | startswith("specforge-"))) | .name'
```

Parse the results to categorize plugins:

- `specforge-backend-*` - Backend framework plugins
- `specforge-db-*` - Database plugins
- `specforge-generate-*` - Codegen pipeline plugins
- `specforge-frontend-*` - Frontend plugins (optional)

## Step 2: Check for Existing Project Structure

Look for existing OpenAPI specification in common locations:

```bash
# Check for OpenAPI spec
find . -maxdepth 3 -name "openapi.yaml" -o -name "openapi.json" -o -name "api.yaml"
```

Common locations:

- `spec/openapi.yaml`
- `spec/openapi.json`
- `api/openapi.yaml`
- `openapi.yaml`

If not found, offer to:

1. Create a new minimal OpenAPI spec
2. Provide example specs they can customize
3. Skip for now (they'll add it later)

## Step 3: Present Stack Selection

Use the **AskUserQuestion** tool to present available stacks in an interactive way.

### Backend Selection

Present available backend plugins discovered in Step 1. For each option, show:

- Technology and framework name
- Brief description
- Compatible databases

Example options:

- **Rust + Axum** - High-performance async web framework
- **Node + Express** - Popular, mature JavaScript framework
- **Python + FastAPI** - Modern Python with automatic OpenAPI
- **Go + Gin** - Fast, minimalist Go web framework

### Database Selection

Filter database plugins based on backend selection compatibility. Show:

- Database type
- Migration strategy
- Compatible with chosen backend

Example options:

- **PostgreSQL** - Robust relational database
- **SQLite** - Lightweight embedded database
- **MySQL** - Popular open-source database
- **MongoDB** - NoSQL document database

### Codegen Pipeline Selection

Filter codegen plugins compatible with both backend and database selections. Show:

- Tool name (e.g., sql-gen, Prisma, sqlc)
- Type safety features
- Build integration

Example options:

- **rust-sql** - Uses sql-gen for compile-time verified queries
- **ts-prisma** - Prisma ORM for TypeScript
- **go-sqlc** - Generates type-safe Go from SQL
- **python-sqlalchemy** - SQLAlchemy ORM

### Frontend Selection (Optional)

Present frontend plugins if user wants full-stack:

- **React + TanStack Query** - Modern React with data fetching
- **Vue + Pinia** - Vue 3 with state management
- **Next.js** - React with SSR/SSG
- **Svelte** - Compiled reactive framework

## Step 4: Generate Project Structure

Create the standard SpecForge directory structure:

```bash
mkdir -p spec backend frontend docker tests migrations
```

Directory structure:

```
project/
├── spec/
│   └── openapi.yaml              # OpenAPI specification
├── migrations/                    # Database migrations
│   └── 001_initial.sql
├── backend/                       # Backend code
├── frontend/                      # Frontend code (if selected)
├── docker/                        # Docker configs
│   └── docker-compose.yml
├── tests/                         # Integration tests
├── CLAUDE.md                      # SpecForge configuration
└── README.md
```

## Step 5: Install Selected Plugins

For each selected plugin, use the `/plugin install` command:

```bash
# Install the three required plugins
/plugin install specforge-backend-{technology}-{framework}
/plugin install specforge-db-{database}
/plugin install specforge-generate-{technology}-{database}

# Optional: Install frontend plugin
/plugin install specforge-frontend-{framework}-{variant}
```

**Note**: These commands should be executed by Claude Code, not in bash.

## Step 6: Invoke Plugin Setup Skills

Delegate to each plugin's setup skill to initialize project files:

### Backend Plugin Setup

Invoke the backend plugin's initialization skill:

```
Use the {backend-plugin}/setup skill to:
- Generate project scaffold (Cargo.toml, package.json, etc.)
- Create main application entry point
- Set up basic routing structure
- Configure build tools
- Create Dockerfile template
```

### Database Plugin Setup

Invoke the database plugin's initialization skill:

```
Use the {database-plugin}/setup skill to:
- Create initial migration file
- Set up migration tooling
- Configure database connection
- Add to docker-compose.yml
- Create health check scripts
```

### Codegen Plugin Setup

Invoke the codegen plugin's initialization skill:

```
Use the {codegen-plugin}/setup skill to:
- Create codegen configuration (sql-gen.toml, prisma.schema, etc.)
- Set up build integration
- Configure output directories
- Add compile-time verification
```

### Frontend Plugin Setup (Optional)

If frontend was selected:

```
Use the {frontend-plugin}/setup skill to:
- Initialize frontend project
- Generate API client from OpenAPI spec
- Set up routing and state management
- Configure build tools
- Add to docker-compose.yml
```

## Step 7: Generate Docker Compose Configuration

Aggregate Docker configurations from all plugins into a unified docker-compose.yml:

```yaml
version: "3.8"

services:
  # From database plugin
  db:
    image: { database-image }
    environment:
      # Database-specific env vars
    volumes:
      - db-data:/var/lib/db
    healthcheck:
      test: { database-health-check }
      interval: 5s
      timeout: 5s
      retries: 5

  # From backend plugin
  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: { database-connection-string }
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/target # For build caching

  # From frontend plugin (if selected)
  web:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3000
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  db-data:
```

## Step 8: Create Initial OpenAPI Spec (if needed)

If no OpenAPI spec exists, create a minimal starter:

```yaml
openapi: 3.1.0
info:
  title: My API
  version: 1.0.0
  description: API built with SpecForge

servers:
  - url: http://localhost:3000
    description: Local development

paths:
  /health:
    get:
      summary: Health check
      description: Returns API health status
      responses:
        "200":
          description: API is healthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: ok

components:
  schemas:
    Error:
      type: object
      required:
        - error
        - message
      properties:
        error:
          type: string
          description: Error code
        message:
          type: string
          description: Human-readable error message
```

## Step 9: Save Configuration to CLAUDE.md

Update or create `CLAUDE.md` with SpecForge configuration:

```markdown
## SpecForge Configuration

**Stack Selection:**

- Backend: {technology}-{framework}
- Database: {database}
- Codegen: {technology}-{database}
- Frontend: {framework}-{variant} (optional)

**Installed Plugins:**

- specforge-backend-{technology}-{framework}
- specforge-db-{database}
- specforge-generate-{technology}-{database}
- specforge-frontend-{framework}-{variant} (optional)

**Project Structure:**

- OpenAPI Spec: `spec/openapi.yaml`
- Database Migrations: `migrations/`
- Backend Code: `backend/`
- Frontend Code: `frontend/` (optional)

**Development:**

- Start all services: `docker-compose up -d`
- View logs: `docker-compose logs -f`
- Stop services: `docker-compose down`

**SpecForge Workflow:**

1. Edit `spec/openapi.yaml` to define API endpoints
2. Run `/specforge:plan` to generate implementation plan
3. Run `/specforge:build` to generate code and implement handlers
4. Run `/specforge:test` to run test suite
5. Run `/specforge:validate` to validate everything works
6. Run `/specforge:ship` to prepare for deployment
```

## Step 10: Summary and Next Steps

Provide the user with:

1. **Installation Summary:**

   - Backend: {selected backend plugin}
   - Database: {selected database plugin}
   - Codegen: {selected codegen plugin}
   - Frontend: {selected frontend plugin} (if applicable)

2. **Files Created:**

   - Project structure
   - OpenAPI spec location
   - Docker configuration
   - Plugin configuration

3. **Next Steps:**

   ```
   1. Review/edit your OpenAPI spec: spec/openapi.yaml
   2. Define your database schema: migrations/001_initial.sql
   3. Start development environment: docker-compose up -d
   4. Generate implementation plan: /specforge:plan
   5. Build your application: /specforge:build
   ```

4. **Quick Start Commands:**

   ```bash
   # Start all services
   docker-compose up -d

   # Check service health
   docker-compose ps

   # View API logs
   docker-compose logs -f api

   # Run migrations
   docker-compose exec api {migration-command}
   ```

## Resources

- **OpenAPI Specification**: https://spec.openapis.org/oas/latest.html
- **OpenAPI Examples**: https://github.com/OAI/OpenAPI-Specification/tree/main/examples
- **OpenAPI Best Practices**: https://learn.openapis.org/best-practices.html
- **SpecForge Documentation**: https://github.com/claude-market/marketplace/tree/main/specforge

## Error Handling

### Plugin Not Found

If a plugin is not available in the marketplace:

- Suggest alternative plugins
- Provide instructions for requesting new plugins
- Link to plugin contribution guide

### Incompatible Plugins

If user selects incompatible plugins:

- Show compatibility matrix
- Suggest compatible alternatives
- Explain why plugins are incompatible

### Existing Project Detected

If project files already exist:

- Warn user about potential overwrites
- Offer to backup existing files
- Allow selective initialization

## Implementation Notes

- Use **AskUserQuestion** for all user selections
- Validate plugin compatibility before installation
- Create backups before modifying existing files
- Provide clear error messages with actionable solutions
- Test Docker configuration before finalizing
