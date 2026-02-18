import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { Location } from './entities/location.entity';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new location' })
  @ApiCreatedResponse({
    description: 'Location created successfully',
    type: Location,
  })
  async create(@Body() dto: CreateLocationDto): Promise<Location> {
    return this.locationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all locations' })
  @ApiResponse({
    status: 200,
    description: 'List of all locations',
    type: [Location],
  })
  async findAll(): Promise<Location[]> {
    return this.locationsService.findAll();
  }
}
