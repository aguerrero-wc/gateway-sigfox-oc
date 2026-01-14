# Database Relationships

## Device -> DeviceMessage

- Type: OneToMany
- FK: device_id in DeviceMessage
- Cascade: SET NULL
- Bidirectional: Yes

## Device Status Tracking

- New field: `status` (varchar, default: 'online')
- Index: `idx_devices_last_seen` on `last_seen` column for efficient health queries

## Location Tracking (Phase 5)

- New fields in Device: `last_lat`, `last_lng`, `location_updated_at`
- These fields store the last known location of the device

## Location -> Device (Phase 6 FIX)

- Type: OneToMany
- FK: location_id in Device table
- Cascade: SET NULL
- Bidirectional: Yes
- Device has `@ManyToOne` to Location with `onDelete: 'SET NULL'`
- Location has `@OneToMany` to Device
