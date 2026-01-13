import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DevicesService } from '../../devices/devices.service';
import { SigfoxPayloadDto } from '../../sigfox/dto/sigfox-payload.dto';
import { SigfoxEventNames } from '../../sigfox/events/sigfox.events';

@Injectable()
export class SigfoxListener {
  private readonly logger = new Logger(SigfoxListener.name);

  constructor(private readonly devicesService: DevicesService) {}

  @OnEvent(SigfoxEventNames.DATA_RECEIVED)
  async handleDataReceived(payload: SigfoxPayloadDto): Promise<void> {
    this.logger.debug(`Processing Sigfox data for device: ${payload.device}`);

    try {
      await this.devicesService.upsertDevice({
        id: payload.device,
        deviceTypeName: payload.deviceType,
        deviceTypeId: payload.deviceTypeId || '',
      });

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
