import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceLocationHistory } from '../../devices/entities/device-location-history.entity';
import { Device } from '../../devices/entities/device.entity';

@Entity('locations')
export class Location {
  @ApiProperty({ description: 'UUID primary key' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'Warehouse A', description: 'Location name' })
  @Column({ name: 'name', type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({
    example: '123 Main St',
    description: 'Street address',
    required: false,
  })
  @Column({ name: 'address', type: 'varchar', length: 500, nullable: true })
  address?: string;

  @ApiProperty({ example: 'Spain', description: 'Country', required: false })
  @Column({ name: 'country', type: 'varchar', length: 100, nullable: true })
  country?: string;

  @ApiProperty({ example: 'Madrid', description: 'City', required: false })
  @Column({ name: 'city', type: 'varchar', length: 100, nullable: true })
  city?: string;

  @ApiProperty({ example: 'Madrid', description: 'Province', required: false })
  @Column({ name: 'province', type: 'varchar', length: 100, nullable: true })
  province?: string;

  @ApiProperty({ example: '28001', description: 'ZIP code', required: false })
  @Column({ name: 'zip', type: 'varchar', length: 20, nullable: true })
  zip?: string;

  @ApiProperty({
    example: 40.416775,
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
    example: -3.703790,
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
    example: 100,
    description: 'Coverage radius in meters for geofencing',
  })
  @Column({
    name: 'radius_meters',
    type: 'int',
    nullable: true,
  })
  radiusMeters?: number;

  @ApiProperty({
    example: 'Main storage facility',
    description: 'Additional notes',
    required: false,
  })
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({
    example: 'client-uuid-123',
    description: 'Client ID for future relation',
    required: false,
  })
  @Column({ name: 'client_id', type: 'varchar', length: 255, nullable: true })
  clientId?: string;

  @OneToMany(
    () => DeviceLocationHistory,
    (history) => history.location,
  )
  deviceLocationHistory!: DeviceLocationHistory[];

  @OneToMany(() => Device, (device) => device.location)
  devices!: Device[];

  @ApiProperty({ description: 'Record creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Record last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
