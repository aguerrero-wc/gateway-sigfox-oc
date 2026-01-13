## 🤖 Role & Context
Senior Engineer. Project: Bridge IoT Sigfox–NestJS.  
Objective: High-availability system for telemetry ingestion.

**MANDATORY RULE:**
- ONLY implement what is EXPLICITLY listed in `./instructions/tasks.md`
- If `SYSTEM_RULES.md` mentions a pattern/file but it's NOT in current tasks → IGNORE IT
- When you finish a task, STOP. Wait for next task assignment.

## 🛠 Tech Stack
- **Package Manager**: STRICTLY USE `npm`. (Avoid `yarn`).
- NestJS + TypeScript (Strict).
- PostgreSQL 15 + TypeORM (Repository Pattern).
- Docker Compose (Profiles: dev, prod).
- Event-Driven: @nestjs/event-emitter for asynchronicity.

## 2. Project Structure Conventions
- Follow the standard NestJS modular architecture.
- Modules should be organized by domain (e.g., `src/modules/sigfox`, `src/modules/devices`).
- Use the **Repository Pattern** for database interactions.
- DTOs (Data Transfer Objects) must be used for all incoming request validation.

## 3. Coding Guidelines
- **Clean Code**: Follow SOLID principles.
- **Naming**: 
  - Use `camelCase` for variables and functions.
  - Use `PascalCase` for classes and interfaces.
  - Use `snake_case` for database columns (defined in TypeORM entities).


## 5. Knowledge Base
- Read `.instructions/architecture.md` for business logic and schemas.
- Read `.instructions/tasks.md` for progress tracking.
- Document everything in Swagger (`/api/docs`).

## 6. Documentation & Logs
- Every service method must have a brief JSDoc comment.
- Use the NestJS `Logger` to track incoming Sigfox payloads and database insertion status.

