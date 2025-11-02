---
name: openapi-expert
description: Expert in OpenAPI specification best practices, validation, and schema design for API-first development
keywords: [openapi, api, specification, schema, validation, rest, api-design]
---

# OpenAPI Expert

Expert guidance on OpenAPI specification best practices, validation, schema design, and API-first development workflows.

## Resources

- **OpenAPI Specification**: https://spec.openapis.org/oas/latest.html
- **OpenAPI Guide**: https://learn.openapis.org/
- **OpenAPI Best Practices**: https://learn.openapis.org/best-practices.html
- **OpenAPI Examples**: https://github.com/OAI/OpenAPI-Specification/tree/main/examples
- **OpenAPI Tools**: https://openapi.tools/

## Core Capabilities

### 1. Validate OpenAPI Specifications

Ensure OpenAPI specs are valid, complete, and follow best practices:

```bash
# Validate using Redocly CLI
redocly lint openapi.yaml

# Validate using Spectral
spectral lint openapi.yaml

# Validate using OpenAPI CLI
openapi-cli validate openapi.yaml
```

**Validation Checklist**:

- All required fields present (openapi version, info, paths)
- Valid JSON/YAML syntax
- Proper schema references ($ref)
- Consistent naming conventions
- Complete response definitions
- Security schemes properly defined
- Examples provided for all operations

### 2. Propose Spec Changes

When proposing changes to OpenAPI specs, ensure:

**Endpoint Design**:

```yaml
paths:
  /api/users/{id}/orders:
    get:
      summary: Get user's orders
      description: |
        Retrieve all orders for a specific user.

        Business Logic:
        - Fetch user from database
        - Query orders with user_id foreign key
        - Include order items with product details
        - Calculate totals

        Performance: Target response time <500ms
      operationId: getUserOrders
      tags:
        - users
        - orders
      parameters:
        - name: id
          in: path
          required: true
          description: User ID
          schema:
            type: integer
            format: int64
        - name: status
          in: query
          description: Filter by order status
          schema:
            type: string
            enum: [pending, completed, cancelled]
      responses:
        "200":
          description: User's orders
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Order"
              examples:
                simple:
                  summary: Orders with items
                  value:
                    - id: 1
                      user_id: 123
                      total_cents: 5999
                      status: completed
                      items:
                        - product_id: 456
                          quantity: 2
                          price_cents: 2999
        "404":
          description: User not found
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
```

**Schema Definitions**:

```yaml
components:
  schemas:
    Order:
      type: object
      required:
        - id
        - user_id
        - total_cents
        - status
        - created_at
      properties:
        id:
          type: integer
          format: int64
          description: Unique order identifier
        user_id:
          type: integer
          format: int64
          description: ID of the user who placed the order
        total_cents:
          type: integer
          description: Total order amount in cents
          minimum: 0
        status:
          type: string
          enum: [pending, completed, cancelled]
          description: Current order status
        created_at:
          type: string
          format: date-time
          description: Timestamp when order was created
        items:
          type: array
          items:
            $ref: "#/components/schemas/OrderItem"
          description: Items in this order
```

### 3. Ensure Spec Quality

**Best Practices**:

1. **Use Detailed Descriptions**

   - Every endpoint should have a clear summary and detailed description
   - Include business logic, edge cases, and performance targets
   - Document security requirements and authorization rules

2. **Provide Comprehensive Examples**

   - Add request examples for common use cases
   - Add response examples showing success and error scenarios
   - Include examples for different parameter combinations

3. **Define Detailed Error Responses**

   ```yaml
   responses:
     "400":
       description: Invalid request
       content:
         application/json:
           schema:
             $ref: "#/components/schemas/Error"
           examples:
             validation-error:
               summary: Validation failed
               value:
                 error: VALIDATION_ERROR
                 message: Invalid email format
                 field: email
             missing-field:
               summary: Required field missing
               value:
                 error: MISSING_FIELD
                 message: Password is required
                 field: password
   ```

4. **Use Schema Validation Rules**

   ```yaml
   properties:
     email:
       type: string
       format: email
       description: User's email address (must be unique)
       maxLength: 255
       example: user@example.com
     password:
       type: string
       minLength: 8
       maxLength: 100
       pattern: '^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$'
       description: Password (min 8 chars, must contain letter and number)
       writeOnly: true
     age:
       type: integer
       minimum: 0
       maximum: 150
       description: User's age in years
   ```

5. **Organize with Tags**

   ```yaml
   tags:
     - name: users
       description: User management operations
     - name: orders
       description: Order management operations
     - name: products
       description: Product catalog operations

   paths:
     /api/users:
       get:
         tags: [users]
         # ...
   ```

6. **Version Your API**

   ```yaml
   info:
     title: My API
     version: 1.0.0
     description: |
       My API provides...

       ## Versioning
       This API uses semantic versioning. Breaking changes will increment major version.

       ## Changelog
       - v1.0.0: Initial release
   ```

7. **Define Security Schemes**

   ```yaml
   components:
     securitySchemes:
       bearerAuth:
         type: http
         scheme: bearer
         bearerFormat: JWT
         description: JWT token obtained from /auth/login

   security:
     - bearerAuth: []

   paths:
     /api/users:
       get:
         security:
           - bearerAuth: []
   ```

8. **Use References to Avoid Duplication**

   ```yaml
   components:
     parameters:
       PageParam:
         name: page
         in: query
         schema:
           type: integer
           minimum: 1
           default: 1
       LimitParam:
         name: limit
         in: query
         schema:
           type: integer
           minimum: 1
           maximum: 100
           default: 20

   paths:
     /api/users:
       get:
         parameters:
           - $ref: "#/components/parameters/PageParam"
           - $ref: "#/components/parameters/LimitParam"
   ```

### 4. Provide Guidance on OpenAPI Patterns

**RESTful Design Patterns**:

```yaml
# Resource Collections
GET    /api/users          # List users
POST   /api/users          # Create user

# Individual Resources
GET    /api/users/{id}     # Get user
PUT    /api/users/{id}     # Replace user
PATCH  /api/users/{id}     # Update user
DELETE /api/users/{id}     # Delete user

# Nested Resources
GET    /api/users/{id}/orders         # Get user's orders
POST   /api/users/{id}/orders         # Create order for user
GET    /api/users/{id}/orders/{orderId}  # Get specific order

# Actions (when REST isn't enough)
POST   /api/users/{id}/reset-password
POST   /api/orders/{id}/cancel
```

**Filtering, Sorting, Pagination**:

```yaml
paths:
  /api/users:
    get:
      parameters:
        # Filtering
        - name: status
          in: query
          schema:
            type: string
            enum: [active, inactive]
        - name: created_after
          in: query
          schema:
            type: string
            format: date-time

        # Sorting
        - name: sort
          in: query
          schema:
            type: string
            enum: [created_at, name, email]
        - name: order
          in: query
          schema:
            type: string
            enum: [asc, desc]
            default: asc

        # Pagination
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20

      responses:
        "200":
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/User"
                  pagination:
                    type: object
                    properties:
                      page:
                        type: integer
                      limit:
                        type: integer
                      total:
                        type: integer
                      pages:
                        type: integer
```

**Error Handling Pattern**:

```yaml
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
          description: Machine-readable error code
          example: VALIDATION_ERROR
        message:
          type: string
          description: Human-readable error message
          example: Invalid email format
        field:
          type: string
          description: Field that caused the error (for validation errors)
          example: email
        details:
          type: object
          description: Additional error details
          additionalProperties: true
```

## Validation Tools Integration

### Redocly CLI

```bash
# Install
npm install -g @redocly/cli

# Lint spec
redocly lint openapi.yaml

# Bundle multiple files
redocly bundle openapi.yaml -o bundled.yaml

# Generate documentation
redocly build-docs openapi.yaml
```

### Spectral (Linting)

```bash
# Install
npm install -g @stoplight/spectral-cli

# Lint with default rules
spectral lint openapi.yaml

# Custom ruleset (.spectral.yaml)
spectral lint openapi.yaml --ruleset .spectral.yaml
```

### Prism (Mock Server)

```bash
# Install
npm install -g @stoplight/prism-cli

# Start mock server
prism mock openapi.yaml

# Validate requests/responses
prism proxy openapi.yaml http://localhost:3000
```

## Common OpenAPI Pitfalls to Avoid

1. **Missing operationId**: Always provide unique operationId for code generation
2. **Inconsistent naming**: Use consistent casing (camelCase, snake_case)
3. **Missing examples**: Add examples for all requests and responses
4. **Vague descriptions**: Be specific about business logic and behavior
5. **Ignoring security**: Define security schemes and apply them appropriately
6. **No error responses**: Document all possible error scenarios
7. **Breaking changes**: Version API properly when making breaking changes
8. **Missing validation**: Use schema constraints (min, max, pattern, enum)

## Schema-First Development Workflow

1. **Design API in OpenAPI first** - Before writing code
2. **Validate spec** - Use linting tools
3. **Review with stakeholders** - Share generated docs
4. **Generate types and clients** - Use OpenAPI generators
5. **Implement handlers** - Using generated types
6. **Contract testing** - Validate implementation matches spec
7. **Document changes** - Update spec version and changelog

## References

- **OpenAPI 3.1 Specification**: https://spec.openapis.org/oas/v3.1.0
- **OpenAPI Data Types**: https://swagger.io/docs/specification/data-models/data-types/
- **Swagger Editor**: https://editor.swagger.io/ (Online editor with validation)
- **OpenAPI Style Guide**: https://apistylebook.com/design/guidelines/
- **REST API Design Best Practices**: https://restfulapi.net/
