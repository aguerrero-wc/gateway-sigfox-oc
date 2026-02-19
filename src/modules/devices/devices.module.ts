import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesService } from './devices.service';
import { DevicesHealthService } from './services/devices-health.service';
import { DevicesController } from './devices.controller';
import { Device } from './entities/device.entity';
import { DeviceMessage } from './entities/device-message.entity';
import { DeviceLocationHistory } from './entities/device-location-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Device, DeviceMessage, DeviceLocationHistory])],
  providers: [DevicesService, DevicesHealthService],
  controllers: [DevicesController],
  exports: [DevicesService, TypeOrmModule],
})
export class DevicesModule {}
