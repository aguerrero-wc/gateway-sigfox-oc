import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DevicesService } from '../../devices/devices.service';
import { SigfoxPayloadDto } from '../../sigfox/dto/sigfox-payload.dto';
import { SigfoxEventNames } from '../../sigfox/events/sigfox.events';
import { SigfoxService } from '../sigfox.service';

@Injectable()
export class SigfoxListener {
  private readonly logger = new Logger(SigfoxListener.name);

  constructor(
    private readonly devicesService: DevicesService,
    @Inject(forwardRef(() => SigfoxService))
    private readonly sigfoxService: SigfoxService,
  ) {}

  @OnEvent(SigfoxEventNames.DATA_RECEIVED)
  async handleDataReceived(payload: SigfoxPayloadDto): Promise<void> {
    this.logger.debug(`Processing Sigfox data for device: ${payload.device}`);

    try {
      // Process MBS/geofencing logic and update device with location
      await this.sigfoxService.processIncomingMessage(payload);

      // Persist raw message to device_messages table
      await this.devicesService.createMessage(payload);

      this.logger.log(
        `Successfully processed message for device: ${payload.device}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process Sigfox data for device ${payload.device}: ${error}`,
      );
      throw error;
    }
  }
}
