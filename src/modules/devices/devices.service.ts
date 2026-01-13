import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Device } from './entities/device.entity';
import { DeviceMessage } from './entities/device-message.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(DeviceMessage)
    private readonly messageRepository: Repository<DeviceMessage>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Upserts a device based on Sigfox device ID.
   * If device exists, updates last_seen; otherwise creates new record.
   */
  async upsertDevice(dto: CreateDeviceDto): Promise<Device> {
    this.logger.debug(`Upserting device: ${dto.id}`);

    const existing = await this.deviceRepository.findOne({
      where: { id: dto.id },
    });

    if (existing) {
      existing.lastSeen = new Date(dto.lastSeen || Date.now());
      existing.deviceTypeName = dto.deviceTypeName;
      existing.deviceTypeId = dto.deviceTypeId;
      return this.deviceRepository.save(existing);
    }

    const device = this.deviceRepository.create({
      id: dto.id,
      deviceTypeName: dto.deviceTypeName,
      deviceTypeId: dto.deviceTypeId,
      lastSeen: dto.lastSeen ? new Date(dto.lastSeen) : new Date(),
    });

    return this.deviceRepository.save(device);
  }

  /**
   * Creates a new device message record from Sigfox payload.
   * Uses transaction to ensure atomicity when creating/updating device and message.
   */
  async createMessage(dto: CreateMessageDto): Promise<DeviceMessage> {
    this.logger.debug(`Creating message for device: ${dto.device}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const deviceRepo = queryRunner.manager.getRepository(Device);
      const messageRepo = queryRunner.manager.getRepository(DeviceMessage);

      const existing = await deviceRepo.findOne({
        where: { id: dto.device },
      });

      let device: Device;
      if (existing) {
        existing.lastSeen = new Date();
        existing.deviceTypeName = dto.deviceType;
        existing.deviceTypeId = dto.deviceTypeId || existing.deviceTypeId;
        device = await deviceRepo.save(existing);
      } else {
        device = await deviceRepo.save(
          deviceRepo.create({
            id: dto.device,
            deviceTypeName: dto.deviceType,
            deviceTypeId: dto.deviceTypeId || '',
            lastSeen: new Date(),
          }),
        );
      }

      const messageId = this.generateMessageId();

      let rssiAvg: number | undefined;
      if (dto.duplicates && dto.duplicates.length > 0) {
        const rssiValues = dto.duplicates
          .filter((d) => d.rssi !== undefined)
          .map((d) => d.rssi!);
        if (rssiValues.length > 0) {
          rssiAvg = rssiValues.reduce((a, b) => a + b, 0) / rssiValues.length;
        }
      }

      const message = await messageRepo.save(
        messageRepo.create({
          id: messageId,
          deviceId: dto.device,
          messageType: dto.messageType,
          dataRaw: dto.data,
          lqi: dto.lqi,
          linkQuality: dto.linkQuality,
          operatorName: dto.operatorName,
          countryCode: dto.countryCode,
          computedLat: dto.computedLocation?.lat,
          computedLng: dto.computedLocation?.lng,
          rssiAvg,
        }),
      );

      await queryRunner.commitTransaction();
      return message;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create message: ${error}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
