# DATABASE ARCHITECTURE & SCHEMA MAP

<!-- 
MAINTENANCE INSTRUCTION FOR AGENTS:
When updating this file, YOU MUST FOLLOW THE "RELATIONSHIP MAP FORMAT" defined below.
Do not use Mermaid diagrams. Use the text-based arrow notation.

FORMAT:
* **Context Name:**
    * `EntityA` (Cardinality) <--> (Cardinality) `EntityB` (via `foreign_key`)
    * Description of specific constraint.
-->

## 1. General Database Rules
*   **Strategy:** Code-first with TypeORM.
*   **IDs:** UUID v4 (`@PrimaryGeneratedColumn('uuid')`).
*   **Naming:** Tables (`snake_case`), Columns (`snake_case`), Properties (`camelCase`).
*   **FK Convention:** Explicit column `clientId` + Relation `client`.

## 2. Relationship Map (The Truth)

*   **Sigfox Device Context:**
    *   `SigfoxDevice` (1) <--> (N) `DeviceMessage`
    *   `SigfoxDevice` (N) <--> (1) `Client` (via `client_id`)
    *   `SigfoxDevice` (1) <--> (N) `DeviceLocationHistory`

*   **Location Context (`src/modules/location`):**
    *   `Location` (1) <--> (N) `DeviceLocationHistory` (via `location_id`)
    *   `Location` (1) <--> (N) `Device` (via `location_id`)
    *   `Location` represents static geofences/points of interest.
    *   `client_id` stored as plain `varchar` (Client entity not yet defined).

## 3. Core Entity Definitions (Summary)
*Do not list all fields. Only Primary Keys, Foreign Keys, and Critical Business Data.*

### `Location` — table: `locations` — module: `src/modules/location`
*   **PK:** `id` (uuid)
*   **FK (soft):** `client_id` (varchar, nullable) — future relation to `Client`
*   **Geo:** `latitude` (decimal 10,8), `longitude` (decimal 11,8), `radius_meters` (int, nullable)
*   **Key Data:** `name`, `address`, `city`, `province`, `zip`, `country`, `notes`
*   **Relations:** `@OneToMany` → `DeviceLocationHistory`, `@OneToMany` → `Device`
*   **Timestamps:** `created_at`, `updated_at`

### `DeviceLocationHistory` — table: `device_location_history` — module: `src/modules/devices`
*   **PK:** `id` (uuid)
*   **FK:** `device_id` (varchar) -> `Device` — `@ManyToOne`, `onDelete: CASCADE`
*   **FK:** `location_id` (uuid, nullable) -> `Location` — `@ManyToOne`, nullable
*   **Geo:** `latitude` (decimal 10,8), `longitude` (decimal 11,8)
*   **Key Data:** `timestamp` (CreateDateColumn), `duplicates` (jsonb, nullable), `location_name` (varchar 255, nullable)
*   **Index:** `idx_device_location_timestamp` on `timestamp`