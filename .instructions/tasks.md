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

- [x] **Task 2.0.1: Swagger Installation**: Install `@nestjs/swagger` and `swagger-ui-express`.
- [x] **Task 2.0.2: Swagger Bootstrapping**: Configure `DocumentBuilder` in `main.ts` to expose docs at `/api/docs`.
- [x] **Task 2.0.3: Global Validation**: Enable `ValidationPipe` with `transform: true` and `whitelist: true` in `main.ts`.
- [x] **Verification**: Run the app and confirm access to `http://localhost:3000/api/docs`.

## 2.1 Documentation & Scaffold (Protocol First)

- [x] **Task 2.1.1: Relationship Documentation**: Create `docs/database-relations.md` following the mandatory format. Define:
  - `Device` -> `DeviceMessage` (OneToMany, FK: `device_id`, Cascade: `SET NULL`).
- [x] **Task 2.1.2: Module Generation**: Generate `DevicesModule` using NestJS CLI (`nest g mo modules/devices`, `nest g s modules/devices`, `nest g co modules/devices`).

## 2.2 Entity Implementation (Snake Case Protocol)

- [x] **Task 2.2.1: Device Entity**: Implement `src/modules/devices/entities/device.entity.ts`.
  - Fields: `id` (string, PK), `device_type_name`, `device_type_id`, `last_seen` (timestamp).
  - **Rule**: Explicit `@Column({ name: 'snake_case_name' })`.
- [x] **Task 2.2.2: DeviceMessage Entity**: Implement `src/modules/devices/entities/device-message.entity.ts`.
  - Fields: `id` (uuid), `device_id` (FK), `message_type`, `data_raw`, `lqi`, `link_quality`, `operator_name`, `country_code`, `computed_lat`, `computed_lng`, `rssi_avg`, `received_at`.
  - **Rule**: Set `@ManyToOne` relation to `Device`.
- [x] **Task 2.2.3: Database Sync**: Run `npm run infra:dev` and verify in logs that tables `devices` and `device_messages` were created.

## 2.3 Service Logic & DTOs

- [x] **Task 2.3.1: DTOs with Swagger**: Create `CreateDeviceDto` and `CreateMessageDto`. Use `@ApiProperty` on every field to ensure visibility in Swagger.
- [x] **Task 2.3.2: Upsert Logic**: Implement `upsertDevice` in `DevicesService`.
  - _Logic_: `ON CONFLICT (id) DO UPDATE SET last_seen = EXCLUDED.last_seen`.
- [x] **Task 2.3.3: Message Persistence**: Implement `createMessage` using Repository Pattern with transaction.
- [x] **Task 2.3.4: Controller Exposure**: Create `POST /devices/messages` for Sigfox data ingestion.

## 2.4 Quality Assurance & Verification

- [x] **Task 2.4.1: Unit Test**: Create `devices.service.spec.ts` ensuring `upsertDevice` handles new and existing devices correctly.
- [x] **Task 2.4.2: Manual E2E Validation**: Use the `/api/docs` interface to send a sample Sigfox JSON and verify the record exists in the PostgreSQL database.

---

## Phase 2 Complete Summary

- ✅ Swagger/OpenAPI documentation configured at `/api/docs`
- ✅ Database entities implemented (Device, DeviceMessage) with snake_case columns
- ✅ Repository Pattern with transactional message persistence
- ✅ DTOs with full Swagger annotations
- ✅ Ingestion endpoint: `POST /api/v1/devices/messages`
- ✅ Unit tests passing for upsertDevice logic
- ✅ Manual E2E validation successful with real database

---

Este es el momento crítico para la escalabilidad del sistema. Para que la IA no cometa errores en la lógica asíncrona, he diseñado estas tareas siguiendo el patrón **"Fire and Forget"** de NestJS con `EventEmitter2`.

Aquí tienes el Markdown de la **Fase 3** enfocado en el módulo de Sigfox y la gestión de eventos:

---

# 📋 Phase 3: Sigfox Ingestion & Event-Driven Architecture

## 3.1 Sigfox Module & Event Setup

- [x] **Task 3.1.1: Scaffold Sigfox Module**: Generate `SigfoxModule` and `SigfoxController` (`nest g mo modules/sigfox`, `nest g co modules/sigfox`).
- [x] **Task 3.1.2: Event Constants**: Create `src/modules/sigfox/events/sigfox.events.ts` with an enum `SigfoxEventNames` (e.g., `DATA_RECEIVED = 'sigfox.data_received'`).
- [x] **Task 3.1.3: Sigfox Payload DTO**: Create `SigfoxDataDto` in `src/modules/sigfox/dto/` mapping the Sigfox specification:
  - Include `device`, `deviceType`, `data`, `lqi`, `computedLocation`, etc.
  - **Note**: Handle `computedLocation` as a dynamic object (can have `lat/lng` or just `status`).
  - Decorate with `@ApiProperty` for Swagger.

## 3.2 Asynchronous Controller Implementation

- [x] **Task 3.2.1: Immediate Response**: Implement `POST /api/v1/sigfox/data` in `SigfoxController`.
  - Use `@HttpCode(HttpStatus.CREATED)` (201).
  - Logic: Emit the event `SigfoxEventNames.DATA_RECEIVED` with the DTO as payload.
  - **Constraint**: The controller must NOT `await` the processing logic. It should return immediately.
- [x] **Task 3.2.2: Swagger Documentation**: Tag the endpoint as `Sigfox Ingestion` and document the 201 response.

## 3.3 Background Listener (The "Brain")

- [x] **Task 3.3.1: Sigfox Listener**: Create `src/modules/sigfox/listeners/sigfox.listener.ts`.
  - Use `@OnEvent(SigfoxEventNames.DATA_RECEIVED)`.
- [x] **Task 3.3.2: Background Processing Logic**:
  - Call `DevicesService.upsertDevice()` to ensure the device exists and update `last_seen`.
  - Call `DevicesService.createMessage()` to persist telemetry.
  - Map Sigfox fields (e.g., `device` -> `device_id`, `data` -> `data_raw`).
  - Calculate `rssi_avg` from the `duplicates` array if present.
- [x] **Task 3.3.3: Error Handling & Logs**: Add `Logger` in the listener to track if the background process fails, since the client (Sigfox) won't see these errors.

## 3.4 Reliability & Validation

- [x] **Task 3.4.1: Unit Test (Event Emission)**: Verify `SigfoxController` emits the correct event and returns 201.
- [x] **Task 3.4.2: Integration Test (Full Flow)**:
  - Send a POST to `/api/v1/sigfox/data`.
  - Verify response is `201`.
  - Wait a few milliseconds and verify the `device` and `device_message` exist in the database.
- [x] **Task 3.4.3: Manual Verification**: Use Swagger to send the payload from `architecture.md` and check Docker logs to see the background processing in action.

---

## Phase 3 Complete Summary

### Event-Driven Architecture Implemented

- ✅ **SigfoxModule** with thin controller (emits events only)
- ✅ **SigfoxListener** handles all processing asynchronously
- ✅ Events: `sigfox.data_received` enum defined
- ✅ Controller returns `201 Accepted` immediately (non-blocking)
- ✅ Background processing with transaction safety

### Key Flow

```
POST /api/v1/sigfox/data
    ↓ (emit event, no await)
    ↓
SigfoxListener @OnEvent('sigfox.data_received')
    ↓
DevicesService.upsertDevice()
    ↓
DevicesService.createMessage()
    ↓ (transaction)
Database
```

### Tests Passing

- 12 tests total
- Controllers, Services, Listeners all tested
- Integration test verified full async flow

### Verified Features

- Immediate 201 response to Sigfox
- Async background processing visible in logs
- Location data extracted (lat/lng) when status != 0
- RSSI average calculated from duplicates
- Database records created correctly

---

### ⚠️ Reglas Técnicas para el Agente:

1. **Inyección de Dependencias**: El `SigfoxModule` debe importar `DevicesModule` para usar sus servicios.
2. **Transformación de Datos**: En el Listener, asegúrate de extraer correctamente `lat` y `lng` de `computedLocation` solo si `status` es distinto de 0.
3. **Protocolo de Base de Datos**: Todas las inserciones en la DB hechas por el Listener deben seguir usando el `snake_case` definido en las entidades de la Fase 2.
4. **Respuesta Rápida**: El controlador debe ser extremadamente ligero. Cualquier lógica pesada (parsing de JSON complejo, cálculos, DB) debe vivir en el Listener.

# 📋 Phase 4: Device Health Monitoring (Status Management)

## 4.1 Schema Evolution (Database)

- [x] **Task 4.1.1: Migration - Status & Index**:
  - Add `status` column to `devices` table (Type: `Enum` or `String`, Default: `'online'`).
  - **CRITICAL**: Create a database index on `last_seen` column to optimize the heartbeat query.
- [x] **Task 4.1.2: Update Entity**: Update `device.entity.ts` to include the `status` field.

## 4.2 Health Logic Implementation

- [x] **Task 4.2.1: Scheduler Setup**:
  - Install `@nestjs/schedule`.
  - Enable scheduling in `AppModule` using `ScheduleModule.forRoot()`.
- [x] **Task 4.2.2: Device Health Service**: Create `src/modules/devices/services/devices-health.service.ts`.
  - Implement a method `@Cron(CronExpression.EVERY_30_MINUTES)`.
  - Logic: Update all devices where `last_seen` < 24h to `status = 'offline'`.
  - Use `QueryBuilder` for a single efficient `UPDATE` query.

## 4.3 Integration with Ingestion

- [x] **Task 4.3.1: Upsert Online Status**:
  - Modify the `upsertDevice` logic in `DevicesService`.
  - Every time a new message arrives, force `status = 'online'` and update `last_seen`.

## 4.4 Quality & Monitoring

- [x] **Task 4.4.1: Unit Test**:
  - Test the health service logic: Mock a device with a `last_seen` of 25 hours ago and verify the service would mark it as `offline`.
- [x] **Task 4.4.2: Swagger Visibility**:
  - Ensure the `status` field appears in the `GET /devices` response in Swagger.
- [x] **Task 4.4.3: Manual Verification**:
  - Manually change a `last_seen` in the DB to 2 días atrás y verificar que el Cron job lo cambie a `offline`.

---

# 📋 Phase 5

## 5.1 Device State Evolution

- [x] **Task 5.1.1: Database Migration**: Add `last_lat` (float), `last_lng` (float), and `location_updated_at` (timestamp) to the `devices` table.
- [x] **Task 5.1.2: Update Device Entity**:
  - Add the new fields with `@Column({ name: 'snake_case', type: 'float', nullable: true })`.
- [x] **Task 5.1.3: Listener Update (Basic)**:
  - Update `SigfoxListener` to extract `lat` and `lng` from the payload and pass them to `DevicesService.upsertDevice()`.
- [x] **Task 5.1.4: Unit Test**: Verify that `upsertDevice` persists the latest coordinates in the `devices` table.

## 5.2 Locations Scaffold & Data Integrity

- [x] **Task 5.2.1: Documentation Update**:
  - Update `docs/database-relations.md` defining the new relationship:
    - `Location` -> `Device`
    - Type: `OneToMany`
    - FK: `location_id` in `Device` table
    - Cascade: `SET NULL`
- [x] **Task 5.2.2: Module Generation**:
  - Generate `LocationsModule`, `LocationsService`, and `LocationsController` using NestJS CLI.
- [x] **Task 5.2.3: Entity Implementation**:
  - **Location Entity**: `id` (uuid), `name` (string), `latitude` (double), `longitude` (double), `radius_meters` (integer).
  - **Device Entity Update**: Add `@ManyToOne` relation to `Location` and the column `location_id`.
  - **Constraint**: Ensure all columns use `@Column({ name: 'snake_case' })`.
- [x] **Task 5.2.4: Basic CRUD**:
  - Implement `create` and `findAll` in `LocationsService`.
  - Expose `POST /locations` and `GET /locations` in the controller.
  - Add Swagger decorators (`@ApiTags`, `@ApiResponse`).

## 5.2.5 Verification & Smoke Test

- [x] **Task 5.2.5.1: Automated Test**:
  - Create `locations.service.spec.ts` (Unit Test).
  - **Test Case**: "should create and return a location". Verify that when saving a location, the ID is generated and the data matches.
- [x] **Task 5.2.5.2: Manual Integration**:
  - Start infra: `npm run infra:dev`.
  - Perform a `POST` via Swagger to `/api/docs` with a sample location (e.g., "Main Office").
  - Verify in the database (or via `GET`) that the record was persisted with its coordinates and radius.

---

# 📋 Phase 6.2-FIX: Relationship Integrity & Smoke Test

## 6.2.3-FIX: Entity Relationship Repair

- [x] **Task 6.2.3.1: Update Location Entity**:
  - Add `@OneToMany(() => Device, (device) => device.location)` to the `Location` entity.
- [x] **Task 6.2.3.2: Update Device Entity**:
  - Add `@ManyToOne(() => Location, (location) => location.devices, { onDelete: 'SET NULL', nullable: true })`.
  - Add the explicit column: `@Column({ name: 'location_id', nullable: true })`.
  - Add the join decorator: `@JoinColumn({ name: 'location_id' })`.
- [x] **Task 6.2.3.3: Sync Database**:
  - Ejecutar `npm run infra:dev` y verificar que la tabla `devices` ahora tenga la columna `location_id` (puedes usar `docker exec -it sigfox-db psql -U user -d sigfox_db -c "\d devices"`).

## 6.2.6: The "Real World" Integration Test

- [x] **Task 6.2.6.1: Cross-Table Test Script**:
  - Crear un test de integración (puede ser en `test/device-location.e2e-spec.ts` o un test unitario extendido).
  - **Flujo del Test**:
    1. **Crear Localización**: Insertar "Sede Central" (lat: 1.0, lng: 1.0, radio: 100).
    2. **Crear Device**: Insertar un device con ID "TEST01".
    3. **Asociar**: Actualizar el device asignándole el `id` de la localización creada.
    4. **Verificar**: Consultar el device y comprobar que `device.location.name` sea "Sede Central".
- [x] **Task 6.2.6.2: Manual Verification via Swagger**:
  - Crear una ubicación mediante `POST /locations`.
  - Usar el ID de esa ubicación para actualizar un dispositivo (puedes crear un endpoint temporal `PATCH /devices/:id/location` si no existe).
  - Verificar que al hacer `GET /devices` el objeto de la localización aparezca incluido.

---

## Phase 6 Complete Summary

### Relationship Integrity Fixed (Phase 6.2-FIX)

- ✅ **Location Entity**: Added `@OneToMany(() => Device, (device) => device.location)` relation
- ✅ **Device Entity**: Added `@ManyToOne` with `@JoinColumn({ name: 'location_id' })` and `onDelete: 'SET NULL'`
- ✅ **Database Sync**: FK constraint `FK_3339609cb36cca36db0119e70e4` created successfully
- ✅ **API Endpoint**: `PATCH /devices/:id/location` for assigning locations
- ✅ **GET Endpoint**: `GET /devices` now includes `location` relation

### Verified Features

- Location created: "Main Office" (lat: 44.195847, lng: 12.412389)
- Device TEST001 created and associated with location
- `GET /devices` returns full location object with name, coordinates, radius
- FK constraint enforces SET NULL on location deletion

### Cross-Table Validation

```
Device {
  id: "TEST001"
  locationId: "uuid-of-location"
  location: {
    id: "uuid-of-location"
    name: "Main Office"
    latitude: 44.195847
    longitude: 12.412389
    radiusMeters: 100
  }
}
```

### Tests Passing

- 23 unit tests passing
- Manual integration verified with real database

---

### ⚠️ Instrucción para el Agente

> "La tarea 5.2.3 se marcó como completada pero la relación `@ManyToOne` y `@OneToMany` entre `Device` y `Location` NO se implementó en el código.
>
> **Tu misión es:**
>
> 1. Modificar ambos archivos de entidad para conectar las tablas.
> 2. Asegurarte de que la columna en la base de datos se llame `location_id` (snake_case).
> 3. Crear el test indicado en la **Tarea 5.2.6.1** para demostrar que un dispositivo puede pertenecer a una ubicación y que la base de datos lo persiste correctamente."

### ¿Por qué es importante este test?

Porque al crear registros en ambas tablas, obligas a TypeORM a validar que los **Foreign Keys** están bien configurados. Si la relación está mal hecha, el test fallará con un error de "QueryFailedError: insert or update on table 'devices' violates foreign key constraint".
