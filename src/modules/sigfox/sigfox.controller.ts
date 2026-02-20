import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SigfoxPayloadDto } from './dto/sigfox-payload.dto';
import { SigfoxEventNames } from './events/sigfox.events';
import { SigfoxService, ProcessingResult } from './sigfox.service';

@ApiTags('Sigfox Ingestion')
@Controller('sigfox')
export class SigfoxController {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly sigfoxService: SigfoxService,
  ) {}

  @Post('data')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ingest Sigfox telemetry data (async)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        messageType: { type: 'string', example: 'service-data-advanced' },
        deviceType: { type: 'string', example: 'eccotrack' },
        device: { type: 'string', example: '000000' },
        data: { type: 'string', example: 'c1820046001418' },
        lqi: { type: 'string', example: 'Good' },
        linkQuality: { type: 'string', example: '2' },
        operatorName: { type: 'string', example: 'SIGFOX_Italy_EIT_Smart' },
        countryCode: { type: 'string', example: '380' },
        deviceTypeId: { type: 'string', example: '64f5cca3e8939e668434c2f3' },
        duplicates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              bsId: { type: 'string', example: '27B9' },
              rssi: { type: 'number', example: -138.0 },
              nbRep: { type: 'number', example: 2 },
            },
          },
        },
        computedLocation: {
          type: 'object',
          properties: {
            lat: { type: 'number', example: 44.195847 },
            lng: { type: 'number', example: 12.412389 },
            radius: { type: 'number', example: 11000 },
            source: { type: 'number', example: 2 },
            status: { type: 'number', example: 1 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Payload accepted for processing' })
  @ApiResponse({ status: 400, description: 'Invalid payload' })
  async ingest(@Body() payload: SigfoxPayloadDto): Promise<{ status: string }> {
    this.eventEmitter.emit(SigfoxEventNames.DATA_RECEIVED, payload);
    return { status: 'accepted' };
  }

  @Post('callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process Sigfox callback with geofence resolution' })
  @ApiResponse({ status: 200, description: 'Message processed with location match' })
  @ApiResponse({ status: 400, description: 'Invalid payload' })
  async callback(@Body() payload: SigfoxPayloadDto): Promise<ProcessingResult> {
    return this.sigfoxService.processIncomingMessage(payload);
  }
}
