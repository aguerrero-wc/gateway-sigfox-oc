import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsObject,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ComputedLocation {
  @ApiPropertyOptional({ example: 44.195847, description: 'Latitude' })
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiPropertyOptional({ example: 12.412389, description: 'Longitude' })
  @IsNumber()
  @IsOptional()
  lng?: number;

  @ApiPropertyOptional({ example: 11000, description: 'Location radius' })
  @IsNumber()
  @IsOptional()
  radius?: number;

  @ApiPropertyOptional({ example: 2, description: 'Location source' })
  @IsNumber()
  @IsOptional()
  source?: number;

  @ApiPropertyOptional({ example: 1, description: 'Location status' })
  @IsNumber()
  @IsOptional()
  status?: number;
}

export class Duplicate {
  @ApiPropertyOptional({ example: '27B9', description: 'Base station ID' })
  @IsString()
  @IsOptional()
  bsId?: string;

  @ApiPropertyOptional({ example: -138.0, description: 'RSSI value' })
  @IsNumber()
  @IsOptional()
  rssi?: number;

  @ApiPropertyOptional({ example: 2, description: 'Number of repetitions' })
  @IsNumber()
  @IsOptional()
  nbRep?: number;
}

export class CreateMessageDto {
  @ApiProperty({
    example: 'service-data-advanced',
    description: 'Message type from Sigfox',
  })
  @IsString()
  @IsNotEmpty()
  messageType!: string;

  @ApiProperty({ example: 'eccotrack', description: 'Device type name' })
  @IsString()
  @IsNotEmpty()
  deviceType!: string;

  @ApiProperty({ example: '000000', description: 'Sigfox device ID' })
  @IsString()
  @IsNotEmpty()
  device!: string;

  @ApiProperty({
    example: 'c1820046001418',
    description: 'Raw hex payload data',
  })
  @IsString()
  @IsNotEmpty()
  data!: string;

  @ApiPropertyOptional({
    example: 'Good',
    description: 'Link Quality Indicator',
  })
  @IsString()
  @IsOptional()
  lqi?: string;

  @ApiPropertyOptional({ example: '2', description: 'Link quality value' })
  @IsString()
  @IsOptional()
  linkQuality?: string;

  @ApiPropertyOptional({
    example: 'SIGFOX_Italy_EIT_Smart',
    description: 'Operator name',
  })
  @IsString()
  @IsOptional()
  operatorName?: string;

  @ApiPropertyOptional({ example: '380', description: 'Country code' })
  @IsString()
  @IsOptional()
  countryCode?: string;

  @ApiPropertyOptional({
    example: '64f5cca3e8939e668434c2f3',
    description: 'Device type ID',
  })
  @IsString()
  @IsOptional()
  deviceTypeId?: string;

  @ApiPropertyOptional({
    type: [Duplicate],
    description: 'Duplicate base station information',
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Duplicate)
  duplicates?: Duplicate[];

  @ApiPropertyOptional({
    type: ComputedLocation,
    description: 'Computed location data',
  })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => ComputedLocation)
  computedLocation?: ComputedLocation;
}
