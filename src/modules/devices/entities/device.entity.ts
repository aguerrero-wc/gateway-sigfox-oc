import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DeviceMessage } from './device-message.entity';

@Entity('devices')
export class Device {
  @PrimaryColumn({ name: 'id' })
  id!: string;

  @Column({ name: 'device_type_name' })
  deviceTypeName!: string;

  @Column({ name: 'device_type_id' })
  deviceTypeId!: string;

  @Column({ name: 'last_seen', type: 'timestamp', nullable: true })
  lastSeen?: Date;

  @OneToMany(() => DeviceMessage, (message) => message.device, {
    cascade: ['insert', 'update'],
  })
  messages!: DeviceMessage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
