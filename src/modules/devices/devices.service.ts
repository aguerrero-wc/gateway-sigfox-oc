import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Device } from './entities/device.entity';
import { DeviceMessage } from './entities/device-message.entity';
import { CreateDeviceDto } from './dto/create-device.dto';

interface SigfoxPayload {
  messageType: string;
  deviceType: string;
  device: string;
  data: string;
  lqi?: string;
  linkQuality?: string;
  operatorName?: string;
  countryCode?: string;
  deviceTypeId?: string;
  duplicates?: Array<{ bsId?: string; rssi?: number; nbRep?: number }>;
  computedLocation?: {
    lat?: number;
    lng?: number;
    radius?: number;
    source?: number;
    status?: number;
  };
}

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
   * Always sets status to 'online' when device is seen.
   */
  async upsertDevice(dto: CreateDeviceDto): Promise<Device> {
    this.logger.debug(`Upserting device: ${dto.id}`);

    const existing = await this.deviceRepository.findOne({
      where: { id: dto.id },
    });

    const now = new Date(dto.lastSeen || Date.now());

    if (existing) {
      existing.lastSeen = now;
      existing.deviceTypeName = dto.deviceTypeName;
      existing.deviceTypeId = dto.deviceTypeId;
      existing.status = 'online';

      if (dto.lat !== undefined) {
        existing.lastLat = dto.lat;
        existing.lastLng = dto.lng;
        existing.locationUpdatedAt = now;
      }

      return this.deviceRepository.save(existing);
    }

    const device = this.deviceRepository.create({
      id: dto.id,
      deviceTypeName: dto.deviceTypeName,
      deviceTypeId: dto.deviceTypeId,
      lastSeen: now,
      status: 'online',
      lastLat: dto.lat,
      lastLng: dto.lng,
      locationUpdatedAt: dto.lat !== undefined ? now : undefined,
    });

    return this.deviceRepository.save(device);
  }

  /**
   * Creates a new device message record from Sigfox payload.
   * Uses transaction to ensure atomicity when creating/updating device and message.
   */
  async createMessage(payload: SigfoxPayload): Promise<DeviceMessage> {
    this.logger.debug(`Creating message for device: ${payload.device}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const deviceRepo = queryRunner.manager.getRepository(Device);
      const messageRepo = queryRunner.manager.getRepository(DeviceMessage);

      const existing = await deviceRepo.findOne({
        where: { id: payload.device },
      });

      if (existing) {
        existing.lastSeen = new Date();
        existing.deviceTypeName = payload.deviceType;
        existing.deviceTypeId = payload.deviceTypeId || existing.deviceTypeId;
        existing.status = 'online';
        await deviceRepo.save(existing);
      } else {
        await deviceRepo.save(
          deviceRepo.create({
            id: payload.device,
            deviceTypeName: payload.deviceType,
            deviceTypeId: payload.deviceTypeId || '',
            lastSeen: new Date(),
            status: 'online',
          }),
        );
      }

      const messageId = this.generateMessageId();

      let rssiAvg: number | undefined;
      if (payload.duplicates && payload.duplicates.length > 0) {
        const rssiValues = payload.duplicates
          .filter((d) => d.rssi !== undefined)
          .map((d) => d.rssi!);
        if (rssiValues.length > 0) {
          rssiAvg = rssiValues.reduce((a, b) => a + b, 0) / rssiValues.length;
        }
      }

      let computedLat: number | undefined;
      let computedLng: number | undefined;

      if (payload.computedLocation && payload.computedLocation.status !== 0) {
        computedLat = payload.computedLocation.lat;
        computedLng = payload.computedLocation.lng;
      }

      const message = await messageRepo.save(
        messageRepo.create({
          id: messageId,
          deviceId: payload.device,
          messageType: payload.messageType,
          dataRaw: payload.data,
          lqi: payload.lqi,
          linkQuality: payload.linkQuality,
          operatorName: payload.operatorName,
          countryCode: payload.countryCode,
          computedLat,
          computedLng,
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

  /**
   * Assigns a location to a device.
   */
  async assignLocation(
    deviceId: string,
    locationId: string | null,
  ): Promise<Device> {
    this.logger.debug(`Assigning location ${locationId} to device ${deviceId}`);

    const device = await this.deviceRepository.findOne({
      where: { id: deviceId },
    });

    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    device.locationId = locationId || undefined;
    return this.deviceRepository.save(device);
  }

  /**
   * Finds a device by ID with its location relation.
   */
  async findById(deviceId: string): Promise<Device | null> {
    return this.deviceRepository.findOne({
      where: { id: deviceId },
      relations: ['location'],
    });
  }
}
