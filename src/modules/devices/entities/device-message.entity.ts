import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Device } from './device.entity';

@Entity('device_messages')
export class DeviceMessage {
  @PrimaryColumn({ name: 'id' })
  id!: string;

  @Column({ name: 'device_id' })
  deviceId!: string;

  @ManyToOne(() => Device, { onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'device_id' })
  device!: Device;

  @Column({ name: 'message_type' })
  messageType!: string;

  @Column({ name: 'data_raw' })
  dataRaw!: string;

  @Column({ name: 'lqi', nullable: true })
  lqi?: string;

  @Column({ name: 'link_quality', nullable: true })
  linkQuality?: string;

  @Column({ name: 'operator_name', nullable: true })
  operatorName?: string;

  @Column({ name: 'country_code', nullable: true })
  countryCode?: string;

  @Column({ name: 'computed_lat', type: 'float', nullable: true })
  computedLat?: number;

  @Column({ name: 'computed_lng', type: 'float', nullable: true })
  computedLng?: number;

  @Column({ name: 'rssi_avg', type: 'float', nullable: true })
  rssiAvg?: number;

  @CreateDateColumn({ name: 'received_at' })
  receivedAt!: Date;
}
