import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceMessage } from './device-message.entity';
import { DeviceLocationHistory } from './device-location-history.entity';
import { Location } from '../../location/entities/location.entity';

@Entity('devices')
export class Device {
  @ApiProperty({ example: '000000', description: 'Sigfox device ID' })
  @PrimaryColumn({ name: 'id' })
  id!: string;

  @ApiProperty({ example: 'eccotrack', description: 'Device type name' })
  @Column({ name: 'device_type_name' })
  deviceTypeName!: string;

  @ApiProperty({
    example: '64f5cca3e8939e668434c2f3',
    description: 'Device type ID from Sigfox',
  })
  @Column({ name: 'device_type_id' })
  deviceTypeId!: string;

  @ApiProperty({
    example: '2026-01-13T10:30:00.000Z',
    description: 'Last time device was seen',
    required: false,
  })
  @Index('idx_devices_last_seen')
  @Column({ name: 'last_seen', type: 'timestamp', nullable: true })
  lastSeen?: Date;

  @ApiProperty({
    example: 'online',
    description: 'Device status (online/offline)',
    enum: ['online', 'offline'],
    default: 'online',
  })
  @Column({ name: 'status', type: 'varchar', length: 20, default: 'online' })
  status!: string;

  @OneToMany(() => DeviceMessage, (message) => message.device, {
    cascade: ['insert', 'update'],
  })
  messages!: DeviceMessage[];

  @OneToMany(() => DeviceLocationHistory, (history) => history.device, {
    cascade: ['insert', 'update'],
  })
  locationHistory!: DeviceLocationHistory[];

  @ApiProperty({ description: 'Record creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Record last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ApiProperty({
    example: 44.195847,
    description: 'Last known latitude',
    required: false,
  })
  @Column({ name: 'last_lat', type: 'float', nullable: true })
  lastLat?: number;

  @ApiProperty({
    example: 12.412389,
    description: 'Last known longitude',
    required: false,
  })
  @Column({ name: 'last_lng', type: 'float', nullable: true })
  lastLng?: number;

  @ApiProperty({
    example: '2026-01-13T10:30:00.000Z',
    description: 'When location was last updated',
    required: false,
  })
  @Column({ name: 'location_updated_at', type: 'timestamp', nullable: true })
  locationUpdatedAt?: Date;

  @ApiProperty({
    type: () => Location,
    description: 'Associated location',
    required: false,
  })
  @ManyToOne(() => Location, (location) => location.devices, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'location_id' })
  location?: Location;

  @ApiProperty({
    description: 'Foreign key to location',
    required: false,
  })
  @Column({ name: 'location_id', nullable: true })
  locationId?: string;
}
