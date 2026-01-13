# System Architecture: Sigfox IoT Bridge

## Overview
Middleware to receive, decode, and persist telemetry from Sigfox. Optimized for high availability and non-blocking ingestion.

## Data Flow (Asynchronous)
1. **Ingestion**: Sigfox Backend sends a POST request to `/api/v1/sigfox/data`.
2. **Device Validation**: 
   - Extract `device` ID from payload.
   - Check if the device exists in the `devices` table.
   - If not present, create a new record for the device.
3. **Persistence**: Store the full telemetry metadata and raw payload in `device_messages`.
4. **Response**: Return a `201 Created` status code to Sigfox to acknowledge receipt.

## Database Schema (PostgreSQL)

### Table: `devices`
- `id`: string (Primary Key) - Maps to Sigfox `device` ID.
- `device_type_name`: string (from `deviceType`).
- `device_type_id`: string (from `deviceTypeId`).
- `last_seen`: timestamp.

### Table: `device_messages`
- `id`: uuid (Primary Key).
- `device_id`: string (Foreign Key -> devices.id).
- `message_type`: string.
- `data_raw`: string (The hex payload).
- `lqi`: string.
- `link_quality`: integer.
- `operator_name`: string.
- `country_code`: string.
- `computed_lat`: float.
- `computed_lng`: float.
- `rssi_avg`: float (Extracted/Calculated from duplicates).
- `created_at`: timestamp.

## Sigfox Payload Specification (Input Reference)
```json
{
    "messageType": "service-data-advanced",
    "deviceType": "eccotrack",
    "device" : "000000",
    "data": "c1820046001418",
    "lqi":"Good",
    "linkQuality":"2",
    "operatorName":"SIGFOX_Italy_EIT_Smart",
    "countryCode":"380",
    "deviceTypeId":"64f5cca3e8939e668434c2f3",
    "duplicates" : [{"bsId":"27B9","rssi":-138.0,"nbRep":2}], 
    
    "computedLocation": {"lat":44.195847,"lng":12.412389, “radius”:11000, ‘source’:2, “status”:1}
}

```
## Sigfox Payload Specification (Location Variations)
The `computedLocation` object is dynamic:
- `{“lat”:44.19, “lng”:12.41, “radius”:11000, ‘source’:2, “status”:1}`
- or : `{“status”:0}`