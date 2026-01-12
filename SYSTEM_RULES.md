# Project System Rules: Sigfox-Nest-Bridge

## 1. Core Tech Stack & Versions

- **Framework**: NestJS v10+ (Modular Architecture)
- **Language**: TypeScript (Strict Mode enabled)
- **Database**: PostgreSQL 15
- **ORM**: TypeORM (Repository Pattern)
- **Validation**: `class-validator` and `class-transformer`
- **Async**: `@nestjs/event-emitter` for non-blocking ingestion
- **Documentation**: Swagger / OpenAPI (exposed at `/api/docs`)

---

## 2. Coding Standards (Naming & Structure)

### General Naming

- Classes / Interfaces: `PascalCase` (e.g., `SigfoxService`)
- Variables / Functions: `camelCase` (e.g., `upsertDevice`)
- Files: `kebab-case` (e.g., `sigfox-callback.dto.ts`)

### Database Naming

- Tables & Columns: **MUST use `snake_case`**
- Requirement: Explicit use of `@Column({ name: 'column_name' })` in all entities

### Project Structure

- Domain-based modules under `src/modules/`
- DTOs, Entities, and Interfaces separated into dedicated folders per module
- Controllers contain **no business logic**; they only handle routing and DTO validation

---

## 3. Database & Transactional Integrity

### Pattern

- Always use the **Repository Pattern**
- Avoid raw queries unless strictly required for performance

### Atomic Operations

- Any operation affecting multiple tables (e.g., `Device` + `DeviceMessage`) **MUST be wrapped in a transaction**
- Use `QueryRunner` or `DataSource.transaction`

### Connection

- Host MUST be `postgres` (internal Docker service name)
- Connection pool:
  - Development: `max: 20`
  - Production: `max: 100`

---

## 4. The Sigfox Ingestion Protocol (The 201 Rule)

### Non-blocking Ingestion

- Controllers MUST respond with `201 Created` immediately after DTO validation
- Heavy logic (parsing, persistence, calculations) MUST be handled in an **Event Listener**

### Flow
```plaintext
HTTP Request → Controller → DTO Validation → 201 Response
                    ↓
              Event Emitter
                    ↓
              Event Listener → Business Logic → Database
```

---

## 5. Error Handling

### HTTP Exceptions

- Use NestJS built-in exceptions (`BadRequestException`, `NotFoundException`, etc.)
- All errors MUST include meaningful messages
- Production errors MUST NOT expose internal details

### Logging

- Use NestJS Logger
- Levels:
  - Development: `debug`
  - Production: `info`, `warn`, `error`

---

## 6. Security Guidelines

### Environment Variables

- **NEVER** commit `.env` files
- All sensitive data MUST be in environment variables
- Use `.env.example` as template

### Authentication & Authorization

- JWT-based authentication
- Token expiration configurable via `JWT_EXPIRATION`
- Role-based access control (RBAC) where applicable

---

## 7. Testing Requirements

### Unit Tests

- All services MUST have unit tests
- Coverage target: minimum 80%

### Integration Tests

- Critical flows MUST have integration tests
- Database operations MUST be tested with real database

---

## 8. Docker & Deployment

### Profiles

- Development: `dev` profile
- Production: `prod` profile

### Commands
```bash
# Development
docker-compose --profile dev up

# Production
docker-compose --profile prod up -d
```

### Environment

- All services communicate through internal network
- PostgreSQL accessible at `postgres:5432`
- Redis (if enabled) accessible at `redis:6379`

---

## 9. API Documentation

### Swagger

- Endpoint: `/api/docs`
- All endpoints MUST be documented with:
  - `@ApiOperation()`
  - `@ApiResponse()`
  - `@ApiTags()`

### DTOs

- All DTOs MUST use validation decorators
- Example values in `@ApiProperty()` decorator

---

## 10. Git Workflow

### Commit Messages

- Format: `type(scope): message`
- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- Example: `feat(sigfox): add device message ingestion`

### Branches

- `main`: Production-ready code
- `develop`: Development branch
- Feature branches: `feature/description`
- Bugfix branches: `bugfix/description`

---

## 11. Performance Considerations

### Database

- Use indexes on frequently queried columns
- Implement pagination for large datasets
- Avoid N+1 queries

### Caching

- Use Redis for frequently accessed data (production)
- Cache strategy: `allkeys-lru`

---

## 12. Monitoring & Logging

### Health Checks

- Database: `pg_isready`
- Application: `/health` endpoint
- Redis: `redis-cli ping`

### Logs

- JSON format for production
- Rotation: max 3 files, 5MB each
- Compression enabled