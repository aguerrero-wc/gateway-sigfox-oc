import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({ example: 'Main Office', description: 'Location name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 44.195847, description: 'Latitude coordinate' })
  @IsNumber()
  lat!: number;

  @ApiProperty({ example: 12.412389, description: 'Longitude coordinate' })
  @IsNumber()
  lng!: number;

  @ApiPropertyOptional({
    example: 100,
    description: 'Radius in meters',
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  radiusMeters?: number;
}
