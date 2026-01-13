import { Module } from '@nestjs/common';
import { SigfoxController } from './sigfox.controller';
import { SigfoxListener } from './listeners/sigfox.listener';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [DevicesModule],
  controllers: [SigfoxController],
  providers: [SigfoxListener],
})
export class SigfoxModule {}
