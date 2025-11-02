---
name: stack-advisor
description: This skill should be used when users need tech stack recommendations, plugin discovery, or help selecting compatible backend/database/codegen plugins for their SpecForge project. Use this skill to explain trade-offs and help users select the right stack for their needs.
allowed-tools: Read,WebFetch,WebSearch,AskUserQuestion
model: inherit
version: 1.0.0
license: MIT
---

# SpecForge Stack Advisor

Provide expert tech stack recommendations and plugin discovery for SpecForge projects. Help users select compatible backend, database, and codegen plugins based on their requirements.

## Overview

SpecForge uses a three-plugin architecture where users must install:

1. **Backend Plugin** - Framework-specific patterns and handlers (e.g., `specforge-backend-rust-axum`)
2. **Database Plugin** - Database tooling and migrations (e.g., `specforge-db-sqlite`)
3. **Codegen Plugin** - Type-safe code generation bridging backend and database (e.g., `specforge-generate-rust-sql`)

This skill helps users:

- Discover available SpecForge plugins
- Understand compatibility between plugins
- Make informed decisions based on project requirements
- Learn about trade-offs between different stacks

## Prerequisites

- User has installed the core `specforge` plugin
- User understands their project's basic requirements (language preferences, scale, complexity)

## Discovery Process

### Step 1: Understand Requirements

Use AskUserQuestion to gather:

1. **Project Type**

   - New project or existing codebase?
   - Expected scale (prototype, production, high-scale)?
   - Team experience level?

2. **Technology Preferences**

   - Preferred programming language (Rust, TypeScript, Python, Go)?
   - Database preference (PostgreSQL, SQLite, MySQL, MongoDB)?
   - Frontend requirements (React, Vue, Next.js, Svelte)?

3. **Key Priorities**
   - Performance vs development speed?
   - Type safety importance?
   - Team familiarity vs learning curve?
   - Deployment environment (cloud, on-premise, edge)?

### Step 2: Discover Available Plugins

Search the Claude Market marketplace for SpecForge plugins:

```bash
# Backend plugins
specforge-backend-rust-axum
specforge-backend-node-express
specforge-backend-python-fastapi
specforge-backend-go-gin

# Database plugins
specforge-db-postgresql
specforge-db-sqlite
specforge-db-mysql
specforge-db-mongodb

# Codegen plugins
specforge-generate-rust-sql
specforge-generate-ts-prisma
specforge-generate-go-sqlc
specforge-generate-python-sqlalchemy

# Frontend plugins (optional)
specforge-frontend-react-tanstack
specforge-frontend-vue-pinia
specforge-frontend-nextjs
specforge-frontend-svelte
```

Use WebSearch or the GitHub API to find the latest available plugins:

```bash
curl -s https://api.github.com/repos/claude-market/marketplace/contents/ | jq -r '.[] | select(.type == "dir" and (.name | startswith("specforge-"))) | .name'
```

### Step 3: Explain Compatibility

Present compatible plugin combinations based on requirements. Example:

**Rust + Axum + SQLite Stack:**

- Backend: `specforge-backend-rust-axum`
- Database: `specforge-db-sqlite`
- Codegen: `specforge-generate-rust-sql`

**Compatibility Matrix:**

| Backend        | Database                           | Codegen           | Frontend |
| -------------- | ---------------------------------- | ----------------- | -------- |
| rust-axum      | postgresql, sqlite, mysql          | rust-sql          | any      |
| node-express   | postgresql, sqlite, mysql, mongodb | ts-prisma         | any      |
| python-fastapi | postgresql, sqlite, mysql          | python-sqlalchemy | any      |
| go-gin         | postgresql, sqlite, mysql          | go-sqlc           | any      |

### Step 4: Present Recommendations

For each viable stack combination, provide:

1. **Overview** - One-sentence description
2. **Strengths** - Key advantages
3. **Trade-offs** - Considerations or limitations
4. **Best For** - Ideal use cases
5. **Installation Commands** - How to install plugins

## Stack Recommendations

### Rust + Axum + SQLite

**Overview:** High-performance, compile-time verified stack ideal for embedded applications and APIs with strong type safety requirements.

**Strengths:**

- Compile-time verification from database to API
- Excellent performance and memory safety
- Type-safe SQL queries via sql-gen
- Zero-cost abstractions
- Great for embedded systems and edge computing

**Trade-offs:**

- Steeper learning curve for Rust beginners
- Longer compile times
- SQLite not ideal for high-concurrency writes

**Best For:**

- Embedded applications and CLI tools
- Edge computing and IoT devices
- Projects requiring maximum performance and safety
- Teams with Rust experience

**Installation:**

```bash
/plugin install specforge-backend-rust-axum
/plugin install specforge-db-sqlite
/plugin install specforge-generate-rust-sql
```

### Node + Express + PostgreSQL + Prisma

**Overview:** Full-featured stack with excellent developer experience, strong ecosystem, and production-ready tooling.

**Strengths:**

- Huge ecosystem and community support
- Rapid development with TypeScript
- Prisma provides excellent type safety
- PostgreSQL offers robust features (JSONB, full-text search, etc.)
- Easy deployment to most platforms

**Trade-offs:**

- Less compile-time safety than Rust
- Node.js single-threaded event loop limitations
- Memory usage higher than compiled languages

**Best For:**

- Web applications and APIs
- Teams with JavaScript/TypeScript experience
- Projects requiring rapid development
- Startups and MVPs

**Installation:**

```bash
/plugin install specforge-backend-node-express
/plugin install specforge-db-postgresql
/plugin install specforge-generate-ts-prisma
```

### Python + FastAPI + PostgreSQL + SQLAlchemy

**Overview:** Productive stack with excellent async support, automatic API documentation, and strong data science integration.

**Strengths:**

- Fast development with Python's expressiveness
- Excellent async/await support in FastAPI
- Strong typing with Pydantic and type hints
- Great for data science and ML integration
- Automatic OpenAPI documentation

**Trade-offs:**

- Runtime type checking (not compile-time)
- Performance lower than compiled languages
- GIL limitations for CPU-bound tasks

**Best For:**

- Data science and ML applications
- Teams with Python expertise
- Projects requiring rapid prototyping
- APIs with complex business logic

**Installation:**

```bash
/plugin install specforge-backend-python-fastapi
/plugin install specforge-db-postgresql
/plugin install specforge-generate-python-sqlalchemy
```

### Go + Gin + PostgreSQL + sqlc

**Overview:** Simple, fast, and reliable stack with excellent concurrency support and straightforward deployment.

**Strengths:**

- Simple language with fast compilation
- Excellent concurrency with goroutines
- Single binary deployment
- Strong standard library
- sqlc provides compile-time SQL verification

**Trade-offs:**

- Less expressive than other languages
- Smaller ecosystem compared to Node/Python
- Generic support still maturing

**Best For:**

- Microservices and distributed systems
- High-concurrency applications
- Cloud-native deployments
- Teams preferring simplicity over features

**Installation:**

```bash
/plugin install specforge-backend-go-gin
/plugin install specforge-db-postgresql
/plugin install specforge-generate-go-sqlc
```

## Decision Framework

Help users choose based on these factors:

### 1. Performance Requirements

- **High Performance:** Rust > Go > Node ≈ Python
- **Memory Efficiency:** Rust > Go > Node > Python

### 2. Development Speed

- **Rapid Prototyping:** Python > Node > Go > Rust
- **Time to Production:** Node ≈ Python > Go > Rust

### 3. Type Safety

- **Compile-time Safety:** Rust > Go > TypeScript > Python
- **Schema Safety:** All stacks provide compile-time DB verification via codegen

### 4. Team Experience

- **Beginner-friendly:** Python > Node > Go > Rust
- **Enterprise-ready:** All stacks production-ready with proper setup

### 5. Database Selection

**PostgreSQL:**

- Best for: Complex queries, JSONB, full-text search, scalability
- Avoid if: Embedded deployment, zero-configuration needed

**SQLite:**

- Best for: Embedded apps, single-node deployments, development
- Avoid if: High-concurrency writes, distributed systems

**MySQL:**

- Best for: Traditional web apps, shared hosting, WordPress-like systems
- Avoid if: Advanced PostgreSQL features needed

**MongoDB:**

- Best for: Document-oriented data, flexible schemas, rapid iteration
- Avoid if: Complex transactions, strong consistency required

## Frontend Recommendations (Optional)

If users need frontend generation:

### React + TanStack Query

- Best for: Modern SPAs, complex state management
- Strong TypeScript support
- Large ecosystem

### Vue + Pinia

- Best for: Progressive enhancement, simpler apps
- Easier learning curve than React
- Great DX

### Next.js

- Best for: SSR, SEO-critical apps, full-stack frameworks
- Includes routing, API routes, deployment
- Vercel platform integration

### Svelte

- Best for: Performance-critical apps, minimal bundle size
- Compile-time framework
- Simple syntax

## Output Format

Provide recommendations in this structure:

```markdown
## Recommended Stack

Based on your requirements ([list key factors]), I recommend:

**Backend:** [plugin-name]
**Database:** [plugin-name]
**Codegen:** [plugin-name]
**Frontend:** [plugin-name] (optional)

### Why This Stack?

[2-3 sentences explaining the rationale]

### Installation Commands

\`\`\`bash
/plugin install [backend-plugin]
/plugin install [database-plugin]
/plugin install [codegen-plugin]
/plugin install [frontend-plugin] # optional
\`\`\`

### Next Steps

1. Initialize project: `/specforge:init`
2. Review/edit OpenAPI spec: `spec/openapi.yaml`
3. Plan implementation: `/specforge:plan`
4. Build application: `/specforge:build`

### Alternative Options

If [different priority], consider:

- [Alternative stack with brief explanation]
```

## Common Questions

### "What's the fastest stack?"

Rust + Axum provides the highest raw performance, but "fast enough" depends on requirements. Node/Python often sufficient for most web applications.

### "What's easiest to learn?"

Python + FastAPI has the gentlest learning curve. Node + Express second if team knows JavaScript.

### "What has the best ecosystem?"

Node.js has the largest ecosystem. Python strong for data science. Rust/Go smaller but growing.

### "Can I mix technologies?"

SpecForge's plugin system supports mixing any backend + database + codegen that are marked compatible. Check plugin manifests for compatibility declarations.

### "How do I switch stacks later?"

OpenAPI spec and database schema are stack-agnostic. You can regenerate code with different plugins by:

1. Uninstalling old plugins
2. Installing new plugins
3. Running `/specforge:build` again

Business logic in handlers will need porting, but specs remain the same.

## Troubleshooting

### "Plugin not found"

- Check marketplace with WebSearch
- Verify plugin name spelling
- Confirm plugin has been published

### "Incompatible plugins"

- Check plugin manifests for `compatible_with` declarations
- Ensure all three required plugins (backend, database, codegen) are installed
- Some combinations may not be supported yet

### "Unclear requirements"

If user requirements are vague:

1. Ask clarifying questions about project type
2. Inquire about team experience level
3. Understand performance and scale needs
4. Learn about deployment environment

## Resources

- SpecForge Documentation: See `/specforge` plugin README
- Claude Market Marketplace: https://github.com/claude-market/marketplace
- Plugin Compatibility Matrix: Check individual plugin READMEs
- OpenAPI Specification: https://spec.openapis.org/oas/latest.html

## Key Principles

1. **Three plugins required:** Backend + Database + Codegen
2. **Compatibility matters:** Not all combinations work together
3. **No single best stack:** Right choice depends on context
4. **Trade-offs are real:** Every stack has strengths and limitations
5. **Start simple:** Can always add complexity later
6. **Specs are portable:** OpenAPI and schema work across all stacks

When in doubt, recommend the stack that matches team's existing expertise. Productivity trumps theoretical performance for most projects.
