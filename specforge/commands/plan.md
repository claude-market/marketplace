---
name: plan
description: Generate implementation plan with dual-spec changes (OpenAPI + DB schema)
---

# SpecForge Planning Agent

Analyze feature requirements and propose coordinated changes to both OpenAPI spec and database schema.

## Overview

SpecForge's core innovation is the **dual-spec approach**: both OpenAPI and database schemas drive development. This planning command helps you:

1. Analyze feature requirements
2. Propose OpenAPI spec changes
3. Propose database schema changes
4. Generate implementation plan
5. Estimate complexity and agent requirements

## Planning Process

### Step 1: Gather Feature Requirements

Ask the user what feature they want to implement. Use **AskUserQuestion** to collect:

1. **Feature description**: What functionality should this add?
2. **User-facing behavior**: What does the user see/experience?
3. **Data requirements**: What data needs to be stored/retrieved?
4. **Integration points**: Does this interact with existing features?

### Step 2: Analyze Current State

Read and analyze existing specifications:

```bash
# Read current OpenAPI spec
cat spec/openapi.yaml

# Read existing database migrations
ls -la migrations/
cat migrations/*.sql

# Check existing backend code structure
find backend -type f -name "*.rs" -o -name "*.ts" -o -name "*.py" -o -name "*.go" | head -20
```

Understand:

- Current API endpoints
- Existing database schema
- Current data models
- Existing patterns and conventions

### Step 3: Propose OpenAPI Spec Changes

Based on the feature requirements, draft new OpenAPI endpoints with:

#### Detailed Endpoint Specifications

```yaml
paths:
  /api/users/{id}/orders:
    get:
      summary: Get user's orders
      description: |
        Retrieve all orders for a specific user.

        Business Logic:
        1. Authenticate the requesting user
        2. Verify user has permission to view these orders
        3. Fetch user from database by ID
        4. Query orders with user_id foreign key
        5. Include order items with product details via JOIN
        6. Calculate order totals (sum of item prices)
        7. Sort by created_at DESC (most recent first)
        8. Return paginated results

        Edge Cases:
        - User not found: Return 404
        - No orders: Return empty array with 200
        - Permission denied: Return 403
        - Invalid pagination params: Return 400

        Performance Considerations:
        - Use database indexes on user_id and created_at
        - Limit JOIN depth to avoid N+1 queries
        - Default page size: 20, max: 100
        - Consider caching for frequently accessed users

      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
            format: int64
          description: User ID
        - name: page
          in: query
          schema:
            type: integer
            default: 1
            minimum: 1
          description: Page number for pagination
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            minimum: 1
            maximum: 100
          description: Number of orders per page

      responses:
        "200":
          description: User's orders retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/Order"
                  pagination:
                    type: object
                    properties:
                      page:
                        type: integer
                      limit:
                        type: integer
                      total:
                        type: integer
                      totalPages:
                        type: integer
              examples:
                success:
                  value:
                    data:
                      - id: 1
                        userId: 123
                        total: 4999
                        status: completed
                        createdAt: "2025-01-15T10:30:00Z"
                        items:
                          - productId: 456
                            quantity: 2
                            price: 2499
                    pagination:
                      page: 1
                      limit: 20
                      total: 45
                      totalPages: 3
        "404":
          description: User not found
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "403":
          description: Permission denied
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

components:
  schemas:
    Order:
      type: object
      required:
        - id
        - userId
        - total
        - status
        - createdAt
      properties:
        id:
          type: integer
          format: int64
          description: Unique order identifier
        userId:
          type: integer
          format: int64
          description: ID of user who placed the order
        total:
          type: integer
          description: Total price in cents
          example: 4999
        status:
          type: string
          enum: [pending, completed, cancelled]
          description: Current order status
        createdAt:
          type: string
          format: date-time
          description: When order was created
        items:
          type: array
          items:
            $ref: "#/components/schemas/OrderItem"
```

### Step 4: Propose Database Schema Changes

Draft SQL migration files that align with the OpenAPI changes:

```sql
-- migrations/003_add_orders.sql

-- Orders table
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_cents INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Composite index for common query pattern
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Order items table
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    price_cents INTEGER NOT NULL,

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Index for order items queries
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Trigger to update order total when items change
CREATE TRIGGER update_order_total
AFTER INSERT ON order_items
BEGIN
    UPDATE orders
    SET total_cents = (
        SELECT SUM(quantity * price_cents)
        FROM order_items
        WHERE order_id = NEW.order_id
    )
    WHERE id = NEW.order_id;
END;
```

**Schema Design Considerations:**

1. **Foreign Keys**: Maintain referential integrity
2. **Indexes**: Add indexes for common query patterns
3. **Constraints**: Use CHECK constraints for data validation
4. **Triggers**: Consider triggers for computed values
5. **Normalization**: Follow appropriate normal form
6. **Timestamps**: Add created_at/updated_at for auditing

### Step 5: Generate Implementation Plan

Create a comprehensive plan document:

````markdown
## Implementation Plan: User Orders Feature

### Overview

Add ability to create and retrieve orders for users.

### Spec Changes Summary

#### OpenAPI Changes

1. **New Endpoints**:

   - GET /api/users/{id}/orders - Retrieve user's orders
   - POST /api/orders - Create new order
   - GET /api/orders/{id} - Get order details
   - PATCH /api/orders/{id} - Update order status

2. **New Schemas**:
   - Order - Order information
   - OrderItem - Individual order line items
   - CreateOrderRequest - Request payload for creating orders

#### Database Schema Changes

1. **New Tables**:

   - orders (id, user_id, total_cents, status, created_at, updated_at)
   - order_items (id, order_id, product_id, quantity, price_cents)

2. **New Indexes**:

   - idx_orders_user_id
   - idx_orders_status
   - idx_orders_created_at
   - idx_orders_user_status (composite)
   - idx_order_items_order_id

3. **Triggers**:
   - update_order_total - Automatically calculate order total

### Code Generation Required

The **codegen plugin** (e.g., `specforge-generate-rust-sql`) will generate:

1. **Database Models** (from schema):

   - `Order` struct with all fields
   - `OrderItem` struct with all fields
   - Type-safe enums for OrderStatus

2. **Type-Safe Queries** (from schema):

   - `get_orders_by_user_id(pool, user_id, page, limit)` -> `Vec<Order>`
   - `create_order(pool, user_id)` -> `Order`
   - `add_order_item(pool, order_id, product_id, quantity, price)` -> `OrderItem`
   - `get_order_with_items(pool, order_id)` -> `OrderWithItems`

3. **API Types** (from OpenAPI):
   - Request/Response DTOs
   - Validation schemas
   - Serialization code

### Handler Implementation

Using the **backend plugin** (e.g., `specforge-backend-rust-axum`), implement handlers:

#### 1. GET /api/users/{id}/orders

```rust
// Pseudocode - actual implementation by backend plugin agent

pub async fn get_user_orders(
    State(db): State<DatabasePool>,
    Path(user_id): Path<i64>,
    Query(params): Query<PaginationParams>,
) -> Result<Json<OrdersResponse>, ApiError> {
    // 1. Validate user exists (use generated query)
    let user = get_user_by_id(&db, user_id)
        .await?
        .ok_or(ApiError::NotFound)?;

    // 2. Get orders with pagination (use generated query)
    let orders = get_orders_by_user_id(&db, user_id, params.page, params.limit)
        .await?;

    // 3. Get total count for pagination (use generated query)
    let total = count_orders_by_user_id(&db, user_id).await?;

    // 4. Build response
    Ok(Json(OrdersResponse {
        data: orders,
        pagination: Pagination {
            page: params.page,
            limit: params.limit,
            total,
            total_pages: (total + params.limit - 1) / params.limit,
        },
    }))
}
```
````

**Complexity**: Simple CRUD with pagination
**Agent Model**: Haiku (sufficient for generated types + straightforward logic)
**Estimated Time**: 5 minutes

#### 2. POST /api/orders

```rust
// More complex - involves transaction

pub async fn create_order(
    State(db): State<DatabasePool>,
    Json(payload): Json<CreateOrderRequest>,
) -> Result<Json<Order>, ApiError> {
    // 1. Start transaction
    let mut tx = db.begin().await?;

    // 2. Validate user and products exist
    // 3. Check inventory availability
    // 4. Create order
    // 5. Create order items
    // 6. Commit transaction

    // Implementation by backend handler agent
}
```

**Complexity**: Complex - transaction, validation, multiple tables
**Agent Model**: Sonnet (complex business logic, error handling)
**Estimated Time**: 15 minutes

### Testing Strategy

Generate tests using **backend test agent**:

1. **Unit Tests**:

   - Test handler logic with mocked database
   - Test validation rules
   - Test error cases

2. **Integration Tests**:

   - Full flow from HTTP request to database
   - Test transaction rollback
   - Test pagination logic

3. **Behavior Observation**:
   - Verify correct SQL queries generated
   - Check response format matches OpenAPI
   - Validate error responses

### Migration Strategy

1. **Development**:

   - Run migration locally: `./migrate.sh migrations/003_add_orders.sql`
   - Verify schema with: `sqlite3 dev.db .schema`

2. **Testing**:

   - Apply migration to test database
   - Run codegen to verify types
   - Compile backend to catch errors

3. **Production**:
   - Backup database before migration
   - Apply migration with transaction
   - Verify with health check

### Estimated Complexity

**Overall**: Medium complexity

- 4 new endpoints (2 simple, 2 complex)
- 2 new database tables
- Multiple generated types and queries
- Transaction handling required

**Timeline**:

- Spec updates: 10 minutes
- Schema migration: 5 minutes
- Code generation: 2 minutes (automated)
- Handler implementation: 30 minutes (2 Haiku + 2 Sonnet agents)
- Testing: 15 minutes
- **Total**: ~60 minutes

**Cost Estimate**:

- Planning (Sonnet): ~5K tokens
- Handler agents (2 Haiku): ~10K tokens
- Handler agents (2 Sonnet): ~30K tokens
- Test agents (Haiku): ~5K tokens
- **Total**: ~50K tokens ≈ $0.50

### Dependencies

- Requires `users` table to exist
- Requires `products` table to exist
- No external API dependencies

### Risks & Mitigation

1. **Risk**: Race condition in order total calculation
   **Mitigation**: Use database trigger, test with concurrent requests

2. **Risk**: Inventory overselling
   **Mitigation**: Use optimistic locking or row-level locks

3. **Risk**: Large order results causing performance issues
   **Mitigation**: Enforce maximum page size, add query timeouts

```

### Step 6: Present Plan to User

Format the plan clearly and ask for approval:

```

I've analyzed your feature requirements and created an implementation plan.

**Summary:**

- 4 new API endpoints
- 2 new database tables with indexes
- Type-safe code generation from schemas
- Estimated time: 60 minutes
- Estimated cost: $0.50 in AI inference

**Next Steps:**

1. Review the proposed spec changes above
2. If approved, run `/specforge:build` to implement
3. Run `/specforge:test` to verify everything works

Would you like me to proceed with the build, or would you like to modify the plan first?

```

Use **AskUserQuestion** to get approval:
- Proceed with build
- Modify OpenAPI spec
- Modify database schema
- Cancel and revise

## Planning Best Practices

### 1. Detailed Business Logic

Always document business logic in OpenAPI descriptions:
- Step-by-step algorithm
- Edge cases and error handling
- Performance considerations
- Security requirements

### 2. Schema Design Principles

Follow database best practices:
- Proper normalization
- Foreign key constraints
- Appropriate indexes
- Data validation constraints
- Audit timestamps

### 3. Type Safety

Ensure alignment between OpenAPI and database schemas:
- Matching field names (snake_case DB, camelCase API)
- Compatible data types
- Consistent validation rules

### 4. Performance Planning

Consider performance early:
- Index common query patterns
- Avoid N+1 queries with JOINs
- Plan for pagination
- Set reasonable limits

### 5. Error Handling

Define comprehensive error responses:
- HTTP status codes
- Error message format
- Recovery suggestions
- Logging strategy

## Resources

- **OpenAPI Best Practices**: https://learn.openapis.org/best-practices.html
- **Database Design**: https://www.postgresql.org/docs/current/ddl.html
- **SQL Indexing**: https://use-the-index-luke.com/
- **API Design Guide**: https://cloud.google.com/apis/design

## Implementation Notes

- Use the **openapi-expert** skill for spec validation
- Use the **stack-advisor** skill for technology-specific patterns
- Consult plugin documentation for framework-specific conventions
- Validate compatibility between proposed changes and existing code
```
