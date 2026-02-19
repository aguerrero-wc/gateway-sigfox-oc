import { Module } from '@nestjs/common';
import { SigfoxController } from './sigfox.controller';
import { SigfoxListener } from './listeners/sigfox.listener';
import { SigfoxService } from './sigfox.service';
import { DevicesModule } from '../devices/devices.module';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [DevicesModule, LocationModule],
  controllers: [SigfoxController],
  providers: [SigfoxListener, SigfoxService],
})
export class SigfoxModule {}
