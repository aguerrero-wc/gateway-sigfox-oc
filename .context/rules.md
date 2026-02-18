# Project System Rules: Sigfox-Nest-Bridge

## Core Tech Stack & Versions

- **Framework**: NestJS v10+ (Modular Architecture)
- **Language**: TypeScript (Strict Mode enabled)
- **Database**: PostgreSQL 15
- **ORM**: TypeORM (Repository Pattern)
- **Validation**: `class-validator` and `class-transformer`
- **Async**: `@nestjs/event-emitter` for non-blocking ingestion
- **Documentation**: Swagger / OpenAPI (exposed at `/api/docs`)

### Database Naming

- Tables & Columns: **MUST use `snake_case`**
- Requirement: Explicit use of `@Column({ name: 'column_name' })` in all entities

## Database & Transactional Integrity

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


## Error Handling

- Use NestJS `Built-in Exceptions`. All Sigfox callback errors should be logged, but the service should aim to return a valid response to Sigfox if possible to avoid unnecessary retries from their backend.

### Logging

- Use NestJS Logger
- Levels:
  - Development: `debug`
  - Production: `info`, `warn`, `error`

## Security Guidelines

### Environment Variables
- Never hardcode credentials.
- All sensitive data (DB_PASSWORD, etc.) must be retrieved from `process.env`.
- Ensure the API is ready for a simple API Key validation in the future (prepare the structure).

### Authentication & Authorization

- JWT-based authentication
- Token expiration configurable via `JWT_EXPIRATION`
- Role-based access control (RBAC) where applicable

## Testing Requirements

### Unit Tests

- All services MUST have unit tests
- Coverage target: minimum 80%

### Integration Tests

- Critical flows MUST have integration tests
- Database operations MUST be tested with real database

## Docker & Deployment

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

## API Documentation

### Swagger

- Endpoint: `/api/docs`
- All endpoints MUST be documented with:
  - `@ApiResponse()`
  - `@ApiTags()`

### DTOs

- All DTOs MUST use validation decorators
- Example values in `@ApiProperty()` decorator

## Performance Considerations

### Database

- Use indexes on frequently queried columns
- Implement pagination for large datasets
- Avoid N+1 queries

### Caching

- Use Redis for frequently accessed data (production)
- Cache strategy: `allkeys-lru`


## Monitoring & Logging

### Health Checks

- Database: `pg_isready`
- Application: `/health` endpoint
- Redis: `redis-cli ping`

### Logs

- JSON format for production
- Rotation: max 3 files, 5MB each
- Compression enabled

## Entity Creation Protocol (Database Relations)

### Before Creating Any Entity

1. **STOP**: Check if `docs/database-relations.md` exists
2. **Document First**: Add the entity and its relationships to the schema file
3. **Then Code**: Implement the entity with decorators matching the documented relationships

### Validation Rule

⚠️ **ALERT TRIGGER**: If an agent creates an entity file (`*.entity.ts`) WITHOUT updating `docs/database-relations.md`:
```
❌ PROTOCOL VIOLATION DETECTED
Entity created without documentation update.

Required action:
1. Stop current implementation
2. Update docs/database-relations.md with:
   - Entity name
   - All relationships (@OneToMany, @ManyToOne, @OneToOne)
   - Foreign keys
   - Cascade rules
3. Then resume entity implementation
```

### Relationship Documentation Format
```markdown
## EntityA -> EntityB
- Type: [OneToMany|ManyToOne|OneToOne|ManyToMany]
- FK: foreign_key_column in EntityB
- Cascade: [DELETE|SET NULL|RESTRICT]
- Bidirectional: [Yes|No]
```

### Why This Matters

- Prevents circular dependency issues
- Makes database schema visible at a glance
- Ensures consistency between documentation and code
- Helps agents understand existing relationships before adding new ones

## Operational Procedures (Agent Execution)

### Environment Management
- To start/restart development: `npm run infra:dev`
- To check service status: `docker compose --profile dev ps`
- **Rule**: After modifying `docker-compose.yml` or `.env`, the agent MUST execute `npm run infra:dev` to sync the state.

### Deployment Validation
- Before marking a task as DONE:
  1. The agent must verify the container is running: `docker inspect -f '{{.State.Running}}' sigfox-app-dev`
  2. The agent must check logs for runtime errors: `docker compose logs app-dev --tail=20`