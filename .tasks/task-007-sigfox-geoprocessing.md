## Business Context
Process incoming Sigfox messages, perform a geofence lookup against all stored `Locations`, and persist the result in `DeviceLocationHistory`.

## Technical Requirements

### 1. Message Payload (DTO)
Create `SigfoxCallbackDto` to map the incoming test message:
- `device`: string (The Device ID, e.g., "C00005")
- `data`: string (Hex payload)
- `duplicates`: array of objects (bsId, rssi, nbRep)
- `computedLocation`: object { lat: number, lng: number, radius: number }

### 2. Processing Logic (SigfoxService)
Method: `processIncomingMessage(data: SigfoxCallbackDto)`

**Flow:**
1. **Filter Locations:** Fetch all `Location` records FROM database EXCEPT those named "In_transit".
2. **Geofence Matching:**
   - Iterate through all filtered locations.
   - Use `locationService.isPointInRadius` (from Task-006) using:
     - Point A: `computedLocation` from Sigfox.
     - Point B: `Location` coordinates from DB.
     - Radius: `location.radiusMeters`.
3. **Selection Rule:**
   - If multiple locations match, select the one with the **MINIMUM distance** (calculate distance in KM).
   - If NO locations match, set `locationName` to "In_transit" and `locationId` to null (or the ID of the "In_transit" record if found).
4. **Persistence:** Create a record in `DeviceLocationHistory`:
   - `device_id`: Map from `data.device`.
   - `location_id`: The ID of the matched Location.
   - `location_name`: The `name` of the matched Location.
   - `latitude/longitude`: The ORIGINAL coordinates from the Sigfox message (`computedLocation`).
   - `duplicates`: Store the full duplicates array as JSONB.

### 3. Controller Endpoint
- **Method:** search `POST /sigfox/callback`
- **Purpose:** Entry point for Sigfox Backend callbacks.

## Constraints & Edge Cases
- **Device Lookup:** Ensure the device exists in the `SigfoxDevice` table before saving history.
- **In_transit:** If no match is found, the `location_name` MUST be "In_transit".
- **Performance:** For now, fetch all locations. (Architect Note: In production with >1000 locations, this will require spatial indexing/PostGIS).