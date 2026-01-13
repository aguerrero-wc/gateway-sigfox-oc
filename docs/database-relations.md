# Database Relationships

## Device -> DeviceMessage

- Type: OneToMany
- FK: device_id in DeviceMessage
- Cascade: SET NULL
- Bidirectional: Yes

## Device Status Tracking

- New field: `status` (varchar, default: 'online')
- Index: `idx_devices_last_seen` on `last_seen` column for efficient health queries
