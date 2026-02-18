# TASK-004: Location Module - CRUD & Seeding Layer

## Business Context
The `Location` entity is defined. We now need to expose its management via REST API to allow the frontend to manage geofences and points of interest.
Additionally, to validate the geospatial queries later, we need a **Seeder** that populates the database with realistic dummy data.

## Technical Specifications (Strict)

### 1. Data Transfer Objects (DTOs)
*   **Path:** `src/modules/location/dto/`
*   **Library:** `class-validator`, `class-transformer`, `@nestjs/swagger`.
*   **`CreateLocationDto`:** Must validate:
    *   `latitude`/`longitude`: Decimal ranges (-90 to 90, -180 to 180).
    *   `radiusMeters`: Positive integer.
    *   `clientId`: UUID format (optional for now).
*   **`UpdateLocationDto`:** Use `@nestjs/mapped-types` (`PartialType`).

### 2. Service Layer (`LocationService`)
*   **Pattern:** Repository Pattern (Inject `Location` repository).
*   **Methods:** standard CRUD (`create`, `findAll`, `findOne`, `update`, `remove`).
*   **Error Handling:** Throw `NotFoundException` if ID doesn't exist.

### 3. Controller Layer (`LocationController`)
*   **Route:** `/locations`
*   **Documentation:** Full Swagger decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`).

### 4. Seeder Strategy (`LocationSeeder`)
*   **Implementation:** Create a `LocationSeederService` (or a method inside `LocationService` if preferred for simplicity in dev).
*   **Logic:**
    *   Generate 10 synthetic locations.
    *   **Geo:** Use realistic coordinates (e.g., around a specific city like Bogota or Madrid) to avoid random points in the ocean.
    *   **Client decoupling:** Generate random UUIDs for `clientId` since the entity doesn't exist yet.

---

## Execution Plan

- [ ] **Step 1: DTO Implementation**
    *   Create `create-location.dto.ts` and `update-location.dto.ts`.
    *   Apply validation decorators strictly.

- [ ] **Step 2: Service Implementation**
    *   Implement business logic.
    *   Add `logger` context.

- [ ] **Step 3: Controller Implementation**
    *   Connect endpoints.
    *   Apply `ParseUUIDPipe` for ID parameters.

- [ ] **Step 4: Seeder Implementation**
    *   Create a standalone script or a temporary endpoint `POST /locations/seed` (dev environment only) to trigger population.