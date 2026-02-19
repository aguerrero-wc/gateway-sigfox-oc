import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { LocationService } from './location.service';
import { LocationSeederService } from './location-seeder.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { ImportLocationsDto } from './dto/import-locations.dto';
import { TestGeofenceDto } from './dto/test-geofence.dto';
import { Location } from './entities/location.entity';
import type { GeofenceResult } from './location.service';

@ApiTags('Locations')
@Controller('locations')
export class LocationController {
  constructor(
    private readonly locationService: LocationService,
    private readonly locationSeederService: LocationSeederService,
  ) {}

  @Post('seed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[DEV ONLY] Seed 10 realistic locations into the database' })
  @ApiResponse({ status: 200, description: 'Seed result' })
  seed(): Promise<{ seeded: number; skipped: boolean }> {
    return this.locationSeederService.seed();
  }

  @Post('test-geofence')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test if a point is within a geofence radius (Haversine)' })
  @ApiResponse({ status: 200, description: 'Geofence test result', type: Object })
  @ApiResponse({ status: 400, description: 'Validation error' })
  testGeofence(@Body() dto: TestGeofenceDto): GeofenceResult {
    return this.locationService.isPointInRadius(dto.point, dto.center, dto.radiusMeters);
  }

  @Post('import-cdn')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk import locations from a CDN-hosted Excel file' })
  @ApiResponse({ status: 200, description: 'Import result', schema: { example: { success: true, count: 42 } } })
  @ApiResponse({ status: 400, description: 'Invalid URL or parsing error' })
  importFromCdn(@Body() dto: ImportLocationsDto): Promise<{ success: boolean; count: number }> {
    return this.locationService.importFromCdn(dto.fileUrl);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new static location (geofence / POI)' })
  @ApiResponse({ status: 201, description: 'Location created', type: Location })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() dto: CreateLocationDto): Promise<Location> {
    return this.locationService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all locations' })
  @ApiResponse({ status: 200, description: 'Array of locations', type: [Location] })
  findAll(): Promise<Location[]> {
    return this.locationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single location by UUID' })
  @ApiParam({ name: 'id', description: 'Location UUID' })
  @ApiResponse({ status: 200, description: 'Location found', type: Location })
  @ApiResponse({ status: 404, description: 'Location not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Location> {
    return this.locationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a location' })
  @ApiParam({ name: 'id', description: 'Location UUID' })
  @ApiResponse({ status: 200, description: 'Location updated', type: Location })
  @ApiResponse({ status: 404, description: 'Location not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLocationDto,
  ): Promise<Location> {
    return this.locationService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a location by UUID' })
  @ApiParam({ name: 'id', description: 'Location UUID' })
  @ApiResponse({ status: 204, description: 'Location deleted' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.locationService.remove(id);
  }
}
