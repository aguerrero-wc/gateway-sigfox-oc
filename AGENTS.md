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

## 📂 Folder Structure Rules
- ALL functional modules must reside in `src/modules/`.
- NO domain logic or entities should be in the root of `src/`.
- Cross-module imports MUST use relative paths (e.g., `../devices/...`).

## 🐳 Docker & Network
- **Network**: `sigfox_network` (Internal bridge, subnet 172.20.0.0/16).
- **Commands**:
  - Dev: `docker compose --profile dev up -d`
  - Build: `docker compose build app-dev`
- **DB Connection**: Host `postgres`, Port `5432`.

## 🏗 Coding & DB Rules
- **Naming**: TS `camelCase`, DB `snake_case` (Mandatory use of `@Column({ name: '...' })`).
- **Atomicity**: Multi-table operations (Upsert Device + Insert Message) MUST use transactions (`QueryRunner`).
- **The 201 Rule**: The Controller responds with `201 Created` immediately after validation and event emission. Persistence happens in the Listener.

## 📖 Knowledge Base
- Read `.instructions/architecture.md` for business logic and schemas.
- Read `.instructions/tasks.md` for progress tracking.
- Document everything in Swagger (`/api/docs`).
