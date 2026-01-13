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


---

# 📋 Phase 2: Core Domain Implementation (Strict Order)

## 2.0 Infrastructure & Global Config (Immediate Setup)
- [ ] **Task 2.0.1: Swagger Installation**: Install `@nestjs/swagger` and `swagger-ui-express`.
- [ ] **Task 2.0.2: Swagger Bootstrapping**: Configure `DocumentBuilder` in `main.ts` to expose docs at `/api/docs`.
- [ ] **Task 2.0.3: Global Validation**: Enable `ValidationPipe` with `transform: true` and `whitelist: true` in `main.ts`.
- [ ] **Verification**: Run the app and confirm access to `http://localhost:3000/api/docs`.

## 2.1 Documentation & Scaffold (Protocol First)
- [ ] **Task 2.1.1: Relationship Documentation**: Create `docs/database-relations.md` following the mandatory format. Define:
    - `Device` -> `DeviceMessage` (OneToMany, FK: `device_id`, Cascade: `SET NULL`).
- [ ] **Task 2.1.2: Module Generation**: Generate `DevicesModule` using NestJS CLI (`nest g mo modules/devices`, `nest g s modules/devices`, `nest g co modules/devices`).

## 2.2 Entity Implementation (Snake Case Protocol)
- [ ] **Task 2.2.1: Device Entity**: Implement `src/modules/devices/entities/device.entity.ts`.
    - Fields: `id` (string, PK), `device_type_name`, `device_type_id`, `last_seen` (timestamp).
    - **Rule**: Explicit `@Column({ name: 'snake_case_name' })`.
- [ ] **Task 2.2.2: DeviceMessage Entity**: Implement `src/modules/devices/entities/device-message.entity.ts`.
    - Fields: `id` (uuid), `device_id` (FK), `message_type`, `data_raw`, `lqi`, `link_quality`, `operator_name`, `country_code`, `computed_lat`, `computed_lng`, `rssi_avg`, `received_at`.
    - **Rule**: Set `@ManyToOne` relation to `Device`.
- [ ] **Task 2.2.3: Database Sync**: Run `npm run infra:dev` and verify in logs that tables `devices` and `device_messages` were created.

## 2.3 Service Logic & DTOs
- [ ] **Task 2.3.1: DTOs with Swagger**: Create `CreateDeviceDto` and `CreateMessageDto`. Use `@ApiProperty` on every field to ensure visibility in Swagger.
- [ ] **Task 2.3.2: Upsert Logic**: Implement `upsertDevice` in `DevicesService`.
    - *Logic*: `ON CONFLICT (id) DO UPDATE SET last_seen = EXCLUDED.last_seen`.
- [ ] **Task 2.3.3: Message Persistence**: Implement `createMessage` using Repository Pattern.
- [ ] **Task 2.3.4: Controller Exposure**: Create `POST /devices` and `POST /devices/messages` (temporary test endpoints) or a combined ingestion endpoint.

## 2.4 Quality Assurance & Verification
- [ ] **Task 2.4.1: Unit Test**: Create `devices.service.spec.ts` ensuring `upsertDevice` handles new and existing devices correctly.
- [ ] **Task 2.4.2: Manual E2E Validation**: Use the `/api/docs` interface to send a sample Sigfox JSON and verify the record exists in the PostgreSQL database.

---
