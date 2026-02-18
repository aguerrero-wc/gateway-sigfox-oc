import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Device } from '../../devices/entities/device.entity';

@Entity('locations')
export class Location {
  @ApiProperty({ description: 'Location UUID' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'Main Office', description: 'Location name' })
  @Column({ name: 'name', length: 255 })
  name!: string;

  @ApiProperty({ example: 44.195847, description: 'Latitude coordinate' })
  @Column({ name: 'latitude', type: 'double precision' })
  latitude!: number;

  @ApiProperty({ example: 12.412389, description: 'Longitude coordinate' })
  @Column({ name: 'longitude', type: 'double precision' })
  longitude!: number;

  @ApiProperty({ example: 100, description: 'Radius in meters' })
  @Column({ name: 'radius_meters', type: 'integer', default: 0 })
  radiusMeters!: number;

  @ApiProperty({
    type: () => [Device],
    description: 'Devices associated with this location',
  })
  @OneToMany(() => Device, (device) => device.location)
  devices!: Device[];

  @ApiProperty({ description: 'Record creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Record last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
