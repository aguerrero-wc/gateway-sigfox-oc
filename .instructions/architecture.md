# System Architecture: Sigfox IoT Bridge

## Overview
Middleware to receive, decode, and persist telemetry from Sigfox. Optimized for high availability and non-blocking ingestion.

## Data Flow (Asynchronous & Event-Driven)
1. **Ingestion**: Sigfox sends POST to `/api/v1/sigfox/data`.
2. **Validation**: API validates payload structure using `SigfoxCallbackDto`.
3. **Dispatch**: **(NUEVO)** The controller emits a `sigfox.received` event and returns `201 Created` immediately.
4. **Processing**: An Event Listener catches the event and performs:
   - **Device Upsert**: Checks if device exists, updates `last_seen`.
   - **Message Persistence**: Calculates `rssi_avg` and stores telemetry.

## Database Schema (PostgreSQL)

### Table: `devices`
- `id`: string (PK) - Sigfox ID.
- `device_type_name`: string.
- `device_type_id`: string.
- `last_seen`: timestamp.

### Table: `device_messages`
- `id`: uuid (PK).
- `device_id`: string (FK -> devices.id).
- `message_type`: string.
- `data_raw`: string.
- `lqi`: string.
- `link_quality`: integer.
- `operator_name`: string.
- `country_code`: string.
- `computed_lat`: float (Nullable if status=0).
- `computed_lng`: float (Nullable if status=0).
- `computed_radius`: integer. **(AGREGADO)**
- `location_status`: integer (1=valid, 0=invalid). **(AGREGADO)**
- `rssi_avg`: float.
- `created_at`: timestamp.