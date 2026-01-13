# Database Relationships

## Device -> DeviceMessage

- Type: OneToMany
- FK: device_id in DeviceMessage
- Cascade: SET NULL
- Bidirectional: Yes
