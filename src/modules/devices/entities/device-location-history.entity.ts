import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Device } from './device.entity';
import { Location } from '../../location/entities/location.entity';

@Entity('device_location_history')
@Index('idx_device_location_timestamp', ['timestamp'])
export class DeviceLocationHistory {
  @ApiProperty({ description: 'UUID primary key' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: 44.195847,
    description: 'Latitude coordinate',
  })
  @Column({
    name: 'latitude',
    type: 'decimal',
    precision: 10,
    scale: 8,
  })
  latitude!: number;

  @ApiProperty({
    example: 12.412389,
    description: 'Longitude coordinate',
  })
  @Column({
    name: 'longitude',
    type: 'decimal',
    precision: 11,
    scale: 8,
  })
  longitude!: number;

  @ApiProperty({
    example: '2026-01-13T10:30:00.000Z',
    description: 'Timestamp of the location record',
  })
  @CreateDateColumn({ name: 'timestamp' })
  timestamp!: Date;

  @ApiProperty({
    example: [{ bsId: '27B9', rssi: -138.0, nbRep: 2 }],
    description: 'Raw Sigfox network duplicates data',
    required: false,
  })
  @Column({ name: 'duplicates', type: 'jsonb', nullable: true })
  duplicates?: any;

  @ApiProperty({
    example: 'Warehouse A',
    description: 'Matched location name if within geofence',
    required: false,
  })
  @Column({ name: 'location_name', type: 'varchar', length: 255, nullable: true })
  locationName?: string;

  @ApiProperty({ description: 'Sigfox device ID' })
  @Column({ name: 'device_id', type: 'varchar', length: 255 })
  deviceId!: string;

  @ManyToOne(() => Device, (device) => device.locationHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'device_id' })
  device!: Device;

  @ApiProperty({
    description: 'Matched location ID if within geofence',
    required: false,
  })
  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId?: string;

  @ManyToOne(() => Location, (location) => location.deviceLocationHistory, {
    nullable: true,
  })
  @JoinColumn({ name: 'location_id' })
  location?: Location;
}
