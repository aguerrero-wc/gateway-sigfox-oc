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

*   **Location Context:**
    *   `Location` (N) <--> (1) `Client` (via `client_id`)
    *   `DeviceLocationHistory` (N) --> (1) `Location` (Optional match via `location_id`)
    *   `Location` represents static geofences/points.

## 3. Core Entity Definitions (Summary)
*Do not list all fields. Only Primary Keys, Foreign Keys, and Critical Business Data.*

### `Location`
*   **PK:** `id` (uuid)
*   **FK:** `client_id` -> `Client`
*   **Geo:** `latitude`, `longitude`, `radiusMeters`
*   **Key Data:** `name`, `address`

### `DeviceLocationHistory`
*   **PK:** `id` (uuid)
*   **FK:** `device_id` -> `SigfoxDevice`
*   **FK:** `location_id` -> `Location` (nullable)
*   **Key Data:** `latitude`, `longitude`, `timestamp`, `duplicates`