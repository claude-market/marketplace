---
name: nodejs-expert
description: "Use when writing or debugging Node.js code — async/await pitfalls (forEach not awaiting, unhandled promise rejections), Express/NestJS/Fastify patterns and error-handler setup, package.json/npm/middleware issues, event loop and stream backpressure, ESM __dirname gaps, or choosing between Express/NestJS/Fastify, Prisma/TypeORM/Drizzle, Zod/Joi/class-validator, JWT/session."
allowed-tools: Read, Grep, Glob, Edit, Write
user-invocable: false
---

# Node.js Expert — Gotchas & Decisions

If the Context7 MCP server is connected, use it to pull current Express/NestJS/Fastify docs. It is an optional external MCP, not shipped or assumed present — if it is not connected, fall back to WebFetch/WebSearch or the official docs.

## Key Decisions

```toon
decisions[4]{choice,use_when}:
  Express vs NestJS vs Fastify,"Express: simple APIs. NestJS: enterprise/DI/decorators. Fastify: high perf"
  Prisma vs TypeORM vs Drizzle,"Prisma: best DX/types. TypeORM: Active Record pattern. Drizzle: SQL-like + lightweight"
  Zod vs Joi vs class-validator,"Zod: TS-first inference. Joi: runtime schemas. class-validator: NestJS decorators"
  JWT vs session,"JWT: stateless/microservices. Session: monolith/server-rendered"
```

## Gotchas

- `forEach` + `async`: does NOT await. Use `for...of` or `Promise.all(items.map(async ...))`
- Express error handler: MUST have 4 params `(err, req, res, next)` — even if unused, or Express ignores it
- Unhandled promise rejection crashes Node 15+ — always catch or use `process.on('unhandledRejection')`
- `asyncHandler` wrapper: wrap Express route handlers to catch async errors → `next(err)`
- `req.body` is `undefined` without `express.json()` middleware — common setup miss
- `process.env.PORT` is string — parse with `parseInt()` or `Number()` before comparison
- NestJS: `@Injectable()` with `@Module({ providers: [...] })` — forgetting module registration = runtime error
- Stream backpressure: always handle `drain` event on writable streams for large data
- `__dirname` not available in ESM — use `import.meta.dirname` (Node 21+) or `fileURLToPath(import.meta.url)`
