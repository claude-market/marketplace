# SpecForge Client Plugin Implementation Guide

**Target Audience**: Expert Claude Code plugin developers
**Purpose**: Build frontend/client framework expertise plugins that make Claude Code an expert in implementing frontend applications using OpenAPI-generated API clients

**Mental Model**: You're creating a **frontend expert team member** who knows React+TanStack, Vue+Pinia, Next.js, or Svelte inside-out and can build UI components, manage state, call APIs using generated clients, and implement routing.

---

## Table of Contents

1. [Plugin Philosophy & Responsibilities](#plugin-philosophy--responsibilities)
2. [The Client Code Generation Flow](#the-client-code-generation-flow)
3. [Plugin Structure & Manifest](#plugin-structure--manifest)
4. [Required Skills (Knowledge Domains)](#required-skills-knowledge-domains)
5. [Required Agents (Executable Workflows)](#required-agents-executable-workflows)
6. [Integration with SpecForge Core](#integration-with-specforge-core)
7. [Framework-Specific Examples](#framework-specific-examples)
8. [Reference Implementation: React + TanStack](#reference-implementation-react--tanstack)

---

## Plugin Philosophy & Responsibilities

### What is a Client Plugin?

A client plugin makes Claude Code an **expert in building frontends** using OpenAPI-generated API client libraries with framework-specific patterns.

**Critical Understanding**: The client plugin does NOT define API types or API call logic. These come from OpenAPI generators.

```
OpenAPI Spec → OpenAPI Client Generator → API Client
  ├─ useCreateUser() hook          (React)
  ├─ useGetUser(id) hook            (React)
  ├─ CreateUserMutationOptions      (TanStack Query types)
  └─ User type                      (Response schema)
```

The client plugin teaches Claude how to:
- Use framework patterns (components, hooks, state management, routing)
- Call APIs using generated client hooks/functions
- Display data from API responses (using generated types)
- Handle loading states, errors, validation
- Implement forms with type-safe API calls
- Set up routing and navigation
- Build component architecture
- Style with CSS/UI libraries

### What Gets Generated (NOT by Client Plugin)

```
OpenAPI Spec → Client Generator → API Client Code
  ├─ API functions (fetch, axios, etc.)
  ├─ Type definitions (User, CreateUserRequest, etc.)
  ├─ React Query hooks (useCreateUser, useGetUser)
  └─ Error types (ApiError, ValidationError)

Client Plugin Teaches → Component Implementation
  ├─ How to use generated hooks
  ├─ Component patterns
  ├─ State management
  ├─ Routing
  ├─ Forms and validation
  └─ Error handling UI
```

### Scope of Responsibility

✅ **Client Plugin DOES**:
- Teach framework patterns (React hooks, Vue composables, etc.)
- Show how to use OpenAPI-generated client code
- Teach component architecture and patterns
- Implement routing and navigation
- Handle loading/error states in UI
- Teach form patterns with generated types
- Provide styling guidance
- Set up dev environment (Vite, Next.js, etc.)

❌ **Client Plugin DOES NOT**:
- Generate API client code (OpenAPI generator does this)
- Define request/response types (OpenAPI generator does this)
- Implement backend API (backend plugin does this)

### Relationship with Other Plugins

```
┌─────────────────────────────────────┐
│  Client Plugin (react-tanstack)     │  ← YOU ARE HERE
│  - UI components                     │
│  - Uses generated API hooks          │
│  - Routing, state management         │
└─────────────────────────────────────┘
              ↓ calls API via generated client
┌─────────────────────────────────────┐
│  OpenAPI Client Generator            │
│  - useCreateUser() hook              │
│  - User type                         │
│  - API error types                   │
└─────────────────────────────────────┘
              ↓ HTTP requests to
┌─────────────────────────────────────┐
│  Backend Plugin (rust-axum)         │
│  - HTTP API handlers                 │
└─────────────────────────────────────┘
```

---

## The Client Code Generation Flow

```
┌─────────────────────────────────────────────────────┐
│ 1. OpenAPI Spec (spec/openapi.yaml)                │
│    - Endpoint definitions                           │
│    - Request/response schemas                       │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 2. OpenAPI Client Generator                        │
│    (openapi-typescript-codegen, orval, etc.)       │
│                                                     │
│    Generates:                                       │
│    - frontend/src/generated/api/client.ts           │
│    - frontend/src/generated/api/hooks.ts            │
│    - frontend/src/generated/api/types.ts            │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 3. Client Plugin (react-tanstack) ← YOU ARE HERE   │
│                                                     │
│    Teaches how to implement:                        │
│    - frontend/src/pages/Users.tsx                   │
│    - frontend/src/components/UserList.tsx           │
│    - frontend/src/components/CreateUserForm.tsx     │
│                                                     │
│    Using generated hooks from step 2                │
└─────────────────────────────────────────────────────┘
```

---

## Plugin Structure & Manifest

### Directory Structure

```
specforge-frontend-{framework}-{variant}/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── {framework}-patterns.md              # Framework patterns (hooks, components)
│   ├── {framework}-api-integration.md       # Using generated API clients
│   ├── {framework}-state-management.md      # State management patterns
│   ├── {framework}-routing.md               # Routing and navigation
│   ├── {framework}-forms.md                 # Form patterns with validation
│   ├── {framework}-error-handling.md        # Error UI patterns
│   ├── {framework}-styling.md               # Styling approaches
│   └── {framework}-dev-setup.md             # Dev environment setup ⭐ REQUIRED
├── agents/
│   ├── component-builder.md                 # Builds components
│   ├── page-builder.md                      # Builds pages/routes
│   └── form-builder.md                      # Builds forms
├── templates/
│   ├── component.template                   # Component template
│   ├── page.template                        # Page template
│   └── form.template                        # Form template
├── examples/
│   ├── simple-crud-ui/
│   └── complex-dashboard/
├── CODEOWNERS
├── README.md
└── LICENSE
```

### Naming Convention

```
specforge-frontend-{framework}-{variant}
```

Examples:
- `specforge-frontend-react-tanstack` (React + TanStack Query)
- `specforge-frontend-vue-pinia` (Vue 3 + Pinia)
- `specforge-frontend-nextjs` (Next.js App Router)
- `specforge-frontend-svelte` (SvelteKit)

### plugin.json Manifest

```json
{
  "name": "specforge-frontend-react-tanstack",
  "version": "1.0.0",
  "description": "React + TanStack Query frontend expertise - build UIs using OpenAPI-generated API clients",
  "author": {
    "name": "Your Name"
  },
  "license": "MIT",
  "keywords": [
    "specforge",
    "frontend",
    "react",
    "tanstack-query",
    "openapi"
  ],
  "skills": [
    "./skills/react-patterns.md",
    "./skills/react-api-integration.md",
    "./skills/tanstack-state-management.md",
    "./skills/react-router-routing.md",
    "./skills/react-forms.md",
    "./skills/react-error-handling.md",
    "./skills/react-styling.md",
    "./skills/react-dev-setup.md"
  ],
  "agents": [
    "./agents/component-builder.md",
    "./agents/page-builder.md",
    "./agents/form-builder.md"
  ]
}
```

---

## Required Skills (Knowledge Domains)

### 1. Framework Patterns Skill ⭐ REQUIRED

**File**: `skills/{framework}-patterns.md`

**Purpose**: Core framework patterns - components, hooks, props, state

**Example**: `skills/react-patterns.md`

```markdown
---
name: react-patterns
description: React patterns - components, hooks, props, state management
keywords: [react, patterns, hooks, components]
---

# React Patterns

Core React patterns for building UI components.

## Component Patterns

### Function Components

```tsx
interface UserCardProps {
  user: User;  // ← Generated type from OpenAPI
  onDelete?: (id: number) => void;
}

export function UserCard({ user, onDelete }: UserCardProps) {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {onDelete && (
        <button onClick={() => onDelete(user.id)}>Delete</button>
      )}
    </div>
  );
}
```

### Composition

```tsx
interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

// Usage
<Layout>
  <UserList />
</Layout>
```

## Hooks

### useState

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### useEffect

```tsx
function DocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
}
```

### Custom Hooks

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const debouncedSearch = useDebounce(searchTerm, 500);
```

## Props and TypeScript

```tsx
// Required props
interface ButtonProps {
  label: string;
  onClick: () => void;
}

// Optional props
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

// Children
interface CardProps {
  title: string;
  children: React.ReactNode;
}

// Event handlers
interface FormProps {
  onSubmit: (data: FormData) => void;
  onChange?: (field: string, value: string) => void;
}
```

### 2. API Integration Skill ⭐ REQUIRED

**File**: `skills/{framework}-api-integration.md`

**Purpose**: How to use OpenAPI-generated client code

**Example**: `skills/react-api-integration.md`

```markdown
---
name: react-api-integration
description: Using OpenAPI-generated API clients with React and TanStack Query
keywords: [react, api, tanstack-query, openapi]
---

# React API Integration

How to use OpenAPI-generated API clients with TanStack Query.

## OpenAPI Client Generation

### Using Orval (Recommended for React + TanStack Query)

```bash
npm install -D orval
```

**orval.config.ts**:

```typescript
import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: '../spec/openapi.yaml',
    output: {
      mode: 'tags-split',
      target: 'src/generated/api/endpoints.ts',
      schemas: 'src/generated/api/models',
      client: 'react-query',
      mock: true,
    },
  },
});
```

Run generation:

```bash
npx orval
```

### Generated Code Structure

```
src/generated/api/
├── endpoints/
│   ├── users.ts         # User endpoints hooks
│   └── orders.ts        # Order endpoints hooks
├── models/
│   ├── user.ts          # User type
│   ├── createUserRequest.ts
│   └── errorResponse.ts
└── client.ts            # HTTP client config
```

## Using Generated Hooks

### Query (GET)

```tsx
import { useGetUser } from '@/generated/api/endpoints/users';

function UserProfile({ userId }: { userId: number }) {
  const { data: user, isLoading, error } = useGetUser(userId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### Mutation (POST, PUT, DELETE)

```tsx
import { useCreateUser } from '@/generated/api/endpoints/users';
import type { CreateUserRequest } from '@/generated/api/models';

function CreateUserForm() {
  const createUser = useCreateUser();

  const handleSubmit = async (data: CreateUserRequest) => {
    try {
      const user = await createUser.mutateAsync(data);
      console.log('Created user:', user);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      handleSubmit({
        email: formData.get('email') as string,
        name: formData.get('name') as string,
      });
    }}>
      <input name="email" type="email" required />
      <input name="name" required />
      <button type="submit" disabled={createUser.isPending}>
        {createUser.isPending ? 'Creating...' : 'Create User'}
      </button>
      {createUser.error && <p>Error: {createUser.error.message}</p>}
    </form>
  );
}
```

### List Query with Pagination

```tsx
import { useListUsers } from '@/generated/api/endpoints/users';

function UserList() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListUsers({ page, per_page: 20 });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
      <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
        Previous
      </button>
      <button onClick={() => setPage(p => p + 1)}>
        Next
      </button>
    </div>
  );
}
```

## Query Invalidation

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { useCreateUser, getUserQueryKey } from '@/generated/api/endpoints/users';

function CreateUserButton() {
  const queryClient = useQueryClient();
  const createUser = useCreateUser();

  const handleCreate = async (data: CreateUserRequest) => {
    await createUser.mutateAsync(data);

    // Invalidate users list to refetch
    queryClient.invalidateQueries({ queryKey: getUserQueryKey() });
  };

  return <button onClick={() => handleCreate({...})}>Create</button>;
}
```

## Error Handling

```tsx
import { useGetUser } from '@/generated/api/endpoints/users';
import type { ErrorResponse } from '@/generated/api/models';

function UserProfile({ userId }: { userId: number }) {
  const { data, error } = useGetUser(userId);

  if (error) {
    const apiError = error.response?.data as ErrorResponse;
    return (
      <div className="error">
        <h2>Error</h2>
        <p>{apiError?.error || 'An error occurred'}</p>
        <p>Code: {apiError?.code}</p>
      </div>
    );
  }

  // ...
}
```

### 3. State Management Skill ⭐ REQUIRED

**File**: `skills/{framework}-state-management.md`

**Purpose**: State management patterns (TanStack Query, Zustand, Pinia, etc.)

### 4. Routing Skill ⭐ REQUIRED

**File**: `skills/{framework}-routing.md`

**Purpose**: Routing and navigation patterns

**Example**: `skills/react-router-routing.md`

```markdown
---
name: react-router-routing
description: Routing with React Router v6
keywords: [react, routing, react-router, navigation]
---

# React Router Routing

## Setup

```bash
npm install react-router-dom
```

## Route Configuration

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'users',
        element: <UserList />,
      },
      {
        path: 'users/:id',
        element: <UserDetail />,
      },
      {
        path: 'users/new',
        element: <CreateUser />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}
```

## Navigation

```tsx
import { Link, useNavigate } from 'react-router-dom';

function UserList() {
  const navigate = useNavigate();

  return (
    <div>
      <Link to="/users/new">Create User</Link>

      {users.map(user => (
        <div key={user.id}>
          <Link to={`/users/${user.id}`}>{user.name}</Link>
          <button onClick={() => navigate(`/users/${user.id}`)}>View</button>
        </div>
      ))}
    </div>
  );
}
```

## Route Parameters

```tsx
import { useParams } from 'react-router-dom';

function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const userId = parseInt(id!, 10);

  const { data: user } = useGetUser(userId);

  return <div>{user?.name}</div>;
}
```

### 5. Forms Skill ⭐ REQUIRED

**File**: `skills/{framework}-forms.md`

**Purpose**: Form patterns with validation and type-safe API calls

### 6. Error Handling Skill

**File**: `skills/{framework}-error-handling.md`

**Purpose**: Error UI patterns

### 7. Styling Skill

**File**: `skills/{framework}-styling.md`

**Purpose**: Styling approaches (CSS modules, Tailwind, styled-components, etc.)

### 8. Dev Setup Skill ⭐ REQUIRED

**File**: `skills/{framework}-dev-setup.md`

**Purpose**: Development environment setup

**Example**: `skills/react-dev-setup.md`

```markdown
---
name: react-dev-setup
description: React + Vite development setup with Docker
keywords: [react, vite, docker, setup]
---

# React + Vite Development Setup

## Docker Compose Service

```yaml
services:
  web:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: ${PROJECT_NAME:-app}-web
    environment:
      VITE_API_URL: ${VITE_API_URL:-http://localhost:3000}
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev
```

## Dockerfile.dev

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
```

## Environment Variables

```bash
# .env
VITE_API_URL=http://localhost:3000
```

## Project Structure

```
frontend/
├── src/
│   ├── generated/api/      # OpenAPI generated
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── vite.config.ts
├── package.json
└── tsconfig.json
```

## vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});
```

## package.json

```json
{
  "name": "frontend",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "orval": "^6.0.0"
  }
}
```

---

## Required Agents (Executable Workflows)

### 1. Component Builder Agent ⭐ REQUIRED

**File**: `agents/component-builder.md`

**Model**: Haiku for simple components, Sonnet for complex

**Purpose**: Build UI components using generated API types

**Input**:

```json
{
  "task": "build-component",
  "component_type": "list",
  "entity": "User",
  "api_endpoint": {
    "method": "GET",
    "path": "/api/users",
    "operationId": "listUsers"
  },
  "generated_api_path": "src/generated/api",
  "output_path": "src/components/UserList.tsx"
}
```

**Output**:

```json
{
  "status": "completed",
  "component_code": "...",
  "file_path": "src/components/UserList.tsx",
  "imports": [
    "react",
    "@/generated/api/endpoints/users",
    "@/generated/api/models/user"
  ]
}
```

**Agent Implementation** (excerpt):

```markdown
---
name: component-builder
model: haiku
context_budget: 5000
description: Builds React components using OpenAPI-generated hooks
---

# Component Builder Agent

Build UI components that use OpenAPI-generated API clients.

## Example Output

```tsx
import { useListUsers } from '@/generated/api/endpoints/users';
import type { User } from '@/generated/api/models/user';

export function UserList() {
  const { data, isLoading, error } = useListUsers();

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error loading users: {error.message}</div>;

  return (
    <div className="user-list">
      <h2>Users</h2>
      <ul>
        {data?.users.map((user: User) => (
          <li key={user.id}>
            <strong>{user.name}</strong> - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 2. Page Builder Agent ⭐ REQUIRED

**File**: `agents/page-builder.md`

**Model**: Haiku

**Purpose**: Build full pages/routes

### 3. Form Builder Agent

**File**: `agents/form-builder.md`

**Model**: Haiku

**Purpose**: Build forms with validation

---

## Integration with SpecForge Core

```javascript
// SpecForge /specforge:build - Frontend phase

// Step 1: Generate OpenAPI client
await generateOpenAPIClient({
  spec: 'spec/openapi.yaml',
  output: 'frontend/src/generated/api',
  generator: 'orval',  // From client plugin metadata
  client: 'react-query'
});

// Step 2: Build components
const endpoints = parseOpenAPISpec('spec/openapi.yaml');

await Promise.all([
  // List pages
  invokeAgent('specforge-frontend-react-tanstack/page-builder', {
    page_type: 'list',
    entity: 'User',
    endpoint: endpoints.find(e => e.operationId === 'listUsers')
  }),

  // Detail pages
  invokeAgent('specforge-frontend-react-tanstack/page-builder', {
    page_type: 'detail',
    entity: 'User',
    endpoint: endpoints.find(e => e.operationId === 'getUser')
  }),

  // Forms
  invokeAgent('specforge-frontend-react-tanstack/form-builder', {
    form_type: 'create',
    entity: 'User',
    endpoint: endpoints.find(e => e.operationId === 'createUser')
  })
]);
```

---

## Framework-Specific Examples

### React + TanStack Query

**Client Generator**: Orval (generates React Query hooks)
**State Management**: TanStack Query for server state
**Routing**: React Router v6

### Vue + Pinia

**Client Generator**: openapi-typescript + custom composables
**State Management**: Pinia
**Routing**: Vue Router v4

### Next.js

**Client Generator**: openapi-typescript-codegen
**State Management**: React Query or SWR
**Routing**: Next.js App Router (built-in)

### SvelteKit

**Client Generator**: openapi-typescript
**State Management**: Svelte stores
**Routing**: SvelteKit routing (built-in)

---

## Reference Implementation: React + TanStack

### Complete Component Example

**`src/pages/Users.tsx`**:

```tsx
import { useState } from 'react';
import { useListUsers, useDeleteUser } from '@/generated/api/endpoints/users';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import type { User } from '@/generated/api/models/user';

export function UsersPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useListUsers({ page, per_page: 20 });
  const deleteUser = useDeleteUser();

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;

    try {
      await deleteUser.mutateAsync(id);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="users-page">
      <header>
        <h1>Users</h1>
        <Link to="/users/new" className="btn-primary">
          Create User
        </Link>
      </header>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.users.map((user: User) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <Link to={`/users/${user.id}`}>View</Link>
                <button onClick={() => handleDelete(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage(p => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
```

**`src/pages/CreateUser.tsx`**:

```tsx
import { useNavigate } from 'react-router-dom';
import { useCreateUser } from '@/generated/api/endpoints/users';
import type { CreateUserRequest } from '@/generated/api/models/createUserRequest';

export function CreateUserPage() {
  const navigate = useNavigate();
  const createUser = useCreateUser();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data: CreateUserRequest = {
      email: formData.get('email') as string,
      name: formData.get('name') as string,
    };

    try {
      const user = await createUser.mutateAsync(data);
      navigate(`/users/${user.id}`);
    } catch (error) {
      // Error handled by error state below
    }
  };

  return (
    <div className="create-user-page">
      <h1>Create User</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>

        <div>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" required />
        </div>

        {createUser.error && (
          <div className="error">
            Error: {createUser.error.message}
          </div>
        )}

        <button type="submit" disabled={createUser.isPending}>
          {createUser.isPending ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
}
```

---

## Best Practices Summary

1. **Use Generated Clients**: ALL API calls use OpenAPI-generated hooks/functions
2. **Type Safety**: Leverage TypeScript types from generated code
3. **Loading States**: Always handle loading, error, empty states
4. **Query Invalidation**: Refetch data after mutations
5. **Optimistic Updates**: For better UX (optional)
6. **Error Boundaries**: Catch component errors
7. **Accessibility**: Semantic HTML, ARIA labels
8. **Responsive Design**: Mobile-first approach

---

## Quick Start Checklist

- [ ] Choose framework (react-tanstack, vue-pinia, nextjs, svelte)
- [ ] Identify OpenAPI client generator
- [ ] Create `plugin.json` with `specforge` metadata
- [ ] Create required skills:
  - [ ] `{framework}-patterns.md`
  - [ ] `{framework}-api-integration.md`
  - [ ] `{framework}-state-management.md`
  - [ ] `{framework}-routing.md`
  - [ ] `{framework}-forms.md`
  - [ ] `{framework}-dev-setup.md` ⭐
- [ ] Create required agents:
  - [ ] `component-builder.md`
  - [ ] `page-builder.md`
  - [ ] `form-builder.md`
- [ ] Add templates and examples
- [ ] Test with backend plugin
- [ ] Submit with `/plugin-builder:publish`

---

**End of Client Plugin Implementation Guide**