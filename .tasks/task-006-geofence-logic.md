# TASK-006: Implement Haversine Geofencing Logic

## Business Context
We need a precise algorithm to determine if a device's GPS coordinate falls within a specific `Location` radius.
This logic is the "heart" of the Sigfox processing pipeline (to be implemented later) and must be rigorously tested now via a dedicated endpoint.

## Technical Specifications

### 1. The Algorithm (Haversine)
Refactor the legacy JavaScript code provided below into a clean, typed TypeScript method within `LocationService`.

**Legacy Code to Refactor:**
```javascript
toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}
calculateDistance(coordinate1, coordinate2, radio): boolean {        
    const earthRadius = 6371; // km
    const lat1Rad = this.toRadians(coordinate1.lat);
    const lat2Rad = this.toRadians(coordinate2.lat);
    const deltaLat = this.toRadians(coordinate2.lat - coordinate1.lat);
    const deltaLng = this.toRadians(coordinate2.lng - coordinate1.lng);
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;
    return distance <= radio/1000; // radio input is in meters
}


### 2. Implementation Rules (src/modules/location/location.service.ts)
- **Strict Typing**: Do NOT use any. Define an interface `GeoPoint { lat: number; lng: number }`.
- **Naming**: Rename `calculateDistance` to `isPointInRadius` to reflect that it returns a boolean.
- **Units**: Ensure `radius` input is treated as Meters (matches our DB `radiusMeters`). The formula works in KM, so the division `radio/1000` is correct.

### 3. Testing Endpoint (LocationController)
Create a temporary endpoint to validate this math manually.
Method: POST /locations/test-geofence
DTO: TestGeofenceDto
point: { lat: number, lng: number } (The device)
center: { lat: number, lng: number } (The location)
radiusMeters: number
Response: { isInside: boolean, distanceKm: number } (You might need to adjust the service method to return distance too, or split the logic).

### Architecture Compliance
- Read: `.context/rules.md` regarding "Business Logic placement".
- Read: `.context/database.md` to ensure variable names align with stored entity conventions.