import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  IsPositive,
  IsLatitude,
  IsLongitude,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({ example: 'Warehouse North', description: 'Location name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ example: 'Calle Gran Vía 1', description: 'Street address' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ example: 'Spain', description: 'Country' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ example: 'Madrid', description: 'City' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'Community of Madrid', description: 'Province or state' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  province?: string;

  @ApiPropertyOptional({ example: '28013', description: 'ZIP / Postal code' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  zip?: string;

  @ApiProperty({ example: 40.416775, description: 'Latitude (-90 to 90)' })
  @IsLatitude()
  latitude!: number;

  @ApiProperty({ example: -3.70379, description: 'Longitude (-180 to 180)' })
  @IsLongitude()
  longitude!: number;

  @ApiPropertyOptional({ example: 150, description: 'Coverage radius in meters (positive integer)' })
  @IsInt()
  @IsPositive()
  @IsOptional()
  radiusMeters?: number;

  @ApiPropertyOptional({ example: 'Main cold-storage facility', description: 'Additional notes' })
  @IsString()
  @IsOptional()
  mbs?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Client UUID (optional — Client entity not yet defined)',
  })
  @IsUUID()
  @IsOptional()
  clientId?: string;
}
