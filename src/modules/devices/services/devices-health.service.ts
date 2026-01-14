import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../entities/device.entity';

@Injectable()
export class DevicesHealthService {
  private readonly logger = new Logger(DevicesHealthService.name);

  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  /**
   * Cron job to update device status based on last_seen timestamp.
   * Runs every 30 minutes and marks devices as 'offline' if not seen in 24 hours.
   * Uses a single efficient UPDATE query with WHERE clause.
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async updateOfflineDevices(): Promise<void> {
    this.logger.debug('Running device health check cron job');

    const twentyFourHoursAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);

    const result = await this.deviceRepository
      .createQueryBuilder('device')
      .update(Device)
      .set({ status: 'offline' })
      .where('last_seen < :threshold', { threshold: twentyFourHoursAgo })
      .andWhere('status = :onlineStatus', { onlineStatus: 'online' })
      .execute();

    const affectedRows = result.affected || 0;

    if (affectedRows > 0) {
      this.logger.log(`Updated ${affectedRows} devices to offline status`);
    } else {
      this.logger.debug('No devices marked as offline');
    }
  }
}
