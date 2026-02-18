import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { AssignLocationDto } from './dto/assign-location.dto';
import { DeviceMessage } from './entities/device-message.entity';
import { Device } from './entities/device.entity';

@ApiTags('sigfox')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ingest Sigfox telemetry data' })
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
  @ApiResponse({ status: 201, description: 'Message ingested successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payload' })
  async ingestMessage(@Body() dto: CreateMessageDto): Promise<{ id: string }> {
    const message = await this.devicesService.createMessage(dto as any);
    return { id: message.id };
  }

  @Get()
  @ApiOperation({ summary: 'Get all devices with status and location' })
  @ApiQuery({ name: 'status', required: false, enum: ['online', 'offline'] })
  @ApiResponse({ status: 200, description: 'List of devices' })
  async getDevices(@Query('status') status?: string): Promise<Device[]> {
    const queryBuilder =
      this.devicesService['deviceRepository'].createQueryBuilder('device');

    queryBuilder.leftJoinAndSelect('device.location', 'location');

    if (status) {
      queryBuilder.where('device.status = :status', { status });
    }

    return queryBuilder.orderBy('device.lastSeen', 'DESC').getMany();
  }

  @Patch(':id/location')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign a location to a device' })
  @ApiParam({ name: 'id', description: 'Device ID' })
  @ApiBody({ type: AssignLocationDto })
  @ApiResponse({
    status: 200,
    description: 'Location assigned successfully',
    type: Device,
  })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async assignLocation(
    @Param('id') deviceId: string,
    @Body() dto: AssignLocationDto,
  ): Promise<Device> {
    const device = await this.devicesService.findById(deviceId);
    if (!device) {
      throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
    }
    return this.devicesService.assignLocation(deviceId, dto.locationId || null);
  }
}
