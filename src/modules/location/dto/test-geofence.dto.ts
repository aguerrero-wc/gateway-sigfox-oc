import { IsNumber, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GeoPointDto {
  @ApiProperty({ example: 44.195847, description: 'Latitude (-90 to 90)' })
  @IsNumber()
  @IsNotEmpty()
  @Min(-90)
  @Max(90)
  lat!: number;

  @ApiProperty({ example: 12.412389, description: 'Longitude (-180 to 180)' })
  @IsNumber()
  @IsNotEmpty()
  @Min(-180)
  @Max(180)
  lng!: number;
}

export class TestGeofenceDto {
  @ApiProperty({ type: GeoPointDto, description: 'The device coordinates' })
  @IsNotEmpty()
  point!: GeoPointDto;

  @ApiProperty({ type: GeoPointDto, description: 'The geofence center coordinates' })
  @IsNotEmpty()
  center!: GeoPointDto;

  @ApiProperty({ example: 500, description: 'Radius in meters' })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  radiusMeters!: number;
}
