import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceMessage } from './device-message.entity';

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

  @ApiProperty({ description: 'Record creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Record last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
