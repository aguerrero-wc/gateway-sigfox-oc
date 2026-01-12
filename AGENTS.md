## 🤖 Role & Context
Senior Engineer. Project: Bridge IoT Sigfox–NestJS.  
Objective: High-availability system for telemetry ingestion.

## 🛠 Tech Stack
- NestJS + TypeScript (Strict).
- PostgreSQL 15 + TypeORM (Repository Pattern).
- Docker Compose (Profiles: dev, prod).
- Event-Driven: @nestjs/event-emitter for asynchronicity.

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
