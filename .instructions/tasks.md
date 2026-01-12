## Phase 1: Environment Setup & Infrastructure

- [ ] **1.1 Docker Network & Volumes**
  - [ ] Verify that `docker-compose.yml` includes the `sigfox_network` network.
  - [ ] Verify that persistent volumes are defined for the database.

- [ ] **1.2 NestJS Initialization**
  - [ ] Run `nest new .` (or verify the current project structure).
  - [ ] Install base dependencies:
    - [ ] `@nestjs/typeorm`
    - [ ] `typeorm`
    - [ ] `pg`
    - [ ] `class-validator`
    - [ ] `class-transformer`
    - [ ] `@nestjs/event-emitter`
    - [ ] `@nestjs/swagger`

- [ ] **1.3 Database Connection**
  - [ ] Configure `TypeOrmModule` in `app.module.ts` using environment variables.
  - [ ] Implement **connection pooling** (max 20 connections in dev).

- [ ] **1.4 Environment Security**
  - [ ] Create `.env.example` with all required variables (DB, Port, JWT).
  - [ ] Ensure `.gitignore` includes the `.env` file.

- [ ] **1.5 Infrastructure Smoke Test**
  - [ ] Start the `dev` profile using Docker Compose.
  - [ ] Verify that NestJS successfully connects to Postgres (check container logs).
