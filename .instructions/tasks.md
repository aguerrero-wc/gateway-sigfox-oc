## Phase 1: Environment Setup & Infrastructure

- [x] **1.1 Docker Network & Volumes**
  - [x] Verify that `docker-compose.yml` includes the `sigfox_network` network.
  - [x] Verify that persistent volumes are defined for the database.

- [x] **1.2 NestJS Initialization**
  - [x] Run `nest new .` (or verify the current project structure).
  - [x] Install base dependencies:
    - [x] `@nestjs/typeorm`
    - [x] `typeorm`
    - [x] `pg`
    - [x] `class-validator`
    - [x] `class-transformer`
    - [x] `@nestjs/event-emitter`
    - [x] `@nestjs/swagger`

- [x] **1.3 Database Connection**
  - [x] Configure `TypeOrmModule` in `app.module.ts` using environment variables.
  - [x] Implement **connection pooling** (max 20 connections in dev).

- [x] **1.4 Environment Security**
  - [x] Create `.env.example` with all required variables (DB, Port, JWT).
  - [x] Ensure `.gitignore` includes the `.env` file.

- [x] **1.5 Infrastructure Smoke Test**
  - [x] Start the `dev` profile using Docker Compose.
  - [x] Verify that NestJS successfully connects to Postgres (check container logs).


# Phase 2: Core Domain Implementation (Devices & Messages)

## Task 2.1: Documentation & Module Scaffolding

- [ ] **Relationship Documentation**: Create/Update `docs/database-relations.md` defining the OneToMany relationship between Device and DeviceMessage (FK: `device_id`, Cascade: `SET NULL`)
- [ ] **Scaffold Module**: Generate `DevicesModule`, `DevicesService`, and `DevicesController` using NestJS CLI

## Task 2.2: Entity Implementation (Snake Case Protocol)

- [ ] **Implement Device Entity**:
  - Fields: `id` (string, PK), `device_type_name`, `device_type_id`, `last_seen` (timestamp)
  - Ensure `@Column({ name: '...' })` uses snake_case

- [ ] **Implement DeviceMessage Entity**:
  - Fields: `id` (uuid), `device_id` (FK), `message_type`, `data_raw`, `lqi`, `link_quality`, `operator_name`, `country_code`, `computed_lat`, `computed_lng`, `rssi_avg`, `received_at`
  - Relation: `@ManyToOne` to Device

- [ ] **Migration**: Generate and run the migration to sync PostgreSQL

## Task 2.3: Service Logic (Upsert & Persistence)

- [ ] **DevicesService - Upsert**: Implement `upsertDevice(data: CreateDeviceDto)` logic to handle existence checks for Sigfox ID
- [ ] **DevicesService - Message**: Implement `createMessage(data: CreateMessageDto)` using Repository Pattern
- [ ] **Swagger Integration**: Decorate DTOs and Controller with `@ApiProperty`, `@ApiTags`, and `@ApiResponse`

## Task 2.4: Quality Control (Testing)

- [ ] **Unit Tests**: Create `devices.service.spec.ts` to verify that `upsertDevice` doesn't create duplicate IDs
- [ ] **E2E Validation**: Verify `GET /devices` returns the correct structure via Swagger at `/api/docs`