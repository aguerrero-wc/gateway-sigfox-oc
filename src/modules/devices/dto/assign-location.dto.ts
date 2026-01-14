import { IsUUID, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AssignLocationDto {
  @ApiPropertyOptional({ description: 'Location UUID to assign' })
  @IsUUID()
  @IsOptional()
  locationId?: string;
}
