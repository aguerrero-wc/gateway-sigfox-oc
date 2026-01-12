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

# Phase 2: Data Models & Core Logic

## 2.1 Foundation: Modules & Entities

- [x] **2.1.1 Create Devices Module**: Generate `DevicesModule`, `DevicesService`, and `DevicesController`.

- [x] **2.1.2 Device Entity**: Implement `Device` entity.
  - Fields: `id` (PK, string), `device_type_name`, `device_type_id`, `last_seen` (timestamp).
  - **Rule**: Use `@Column({ name: 'snake_case' })` for all fields.

- [x] **2.1.3 Create Database Relations Schema**: Create `docs/database-relations.md` file.
  - Document all entity relationships in simple format.
  - Include: Entity names, relationship types (@OneToMany, @ManyToOne), foreign keys, cascade rules.
  - Template:

```
    ## Device -> DeviceMessage
    - Type: OneToMany
    - FK: device_id in DeviceMessage
    - Cascade: DELETE
```

- [x] **2.1.4 DeviceMessage Entity**: Implement `DeviceMessage` entity **inside Devices Module** (no separate module needed).
  - Fields: `id` (UUID), `device_id` (FK), `message_type`, `data_raw`, `lqi`, `link_quality`, `operator_name`, `country_code`, `computed_lat`, `computed_lng`, `computed_radius`, `location_status`, `rssi_avg`, `created_at`.
  - **Explicit Relation**: `@ManyToOne(() => Device, device => device.messages, { onDelete: 'CASCADE' })`
  - **Rule**: Set `computed_lat/lng` as nullable (for `location_status: 0`).
  - **IMPORTANT**: Update `docs/database-relations.md` with this relationship BEFORE implementing.

---

## 2.2 Contracts: DTOs & Validation

- [x] **2.2.1 Sigfox Callback DTO**: Create `SigfoxCallbackDto` in `src/modules/sigfox/dto/`.
  - Must match the JSON structure in `architecture.md`.
  - Use `class-validator` for all fields (e.g., `@IsString()`, `@IsOptional()`).
  - Handle the `computedLocation` nested object as a partial DTO.

---

## 2.3 Verification: Swagger & Basic CRUD

- [x] **2.3.1 Swagger Configuration**:
  - [x] Configure `DocumentBuilder` in `main.ts`.

- [x] **2.3.2 Basic Devices API**:
  - [x] Implement `GET /devices` to list registered hardware.
  - [x] Implement `GET /devices/:id/messages` to see history.

---

## 2.4 Database Sync & Integrity

- [ ] **2.4.1 TypeORM Synchronization**:
  - Ensure `synchronize: true` is active in `app.module.ts` (ONLY for this dev phase).
  - Verify in Docker logs that tables `devices` and `device_messages` are created with correct `snake_case` names.

- [ ] **2.4.2 Manual Test**:
  - Insert a dummy device via Swagger and verify persistence in the `postgres` container (`docker exec -it postgres psql -U ...`).

---
