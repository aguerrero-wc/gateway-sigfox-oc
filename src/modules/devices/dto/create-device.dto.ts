import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeviceDto {
  @ApiProperty({ example: '000000', description: 'Sigfox device ID' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ example: 'eccotrack', description: 'Device type name' })
  @IsString()
  @IsNotEmpty()
  deviceTypeName!: string;

  @ApiProperty({
    example: '64f5cca3e8939e668434c2f3',
    description: 'Device type ID from Sigfox',
  })
  @IsString()
  @IsNotEmpty()
  deviceTypeId!: string;

  @ApiPropertyOptional({ description: 'Last seen timestamp' })
  @IsDateString()
  @IsOptional()
  lastSeen?: string;

  @ApiPropertyOptional({
    example: 44.195847,
    description: 'Last known latitude',
  })
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiPropertyOptional({
    example: 12.412389,
    description: 'Last known longitude',
  })
  @IsNumber()
  @IsOptional()
  lng?: number;
}
