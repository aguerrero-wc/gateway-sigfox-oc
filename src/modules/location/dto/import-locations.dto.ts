import { IsString, IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImportLocationsDto {
  @ApiProperty({
    example:
      'https://video-item.sfo3.cdn.digitaloceanspaces.com/Technogym%20-%20Providers%20list.xlsx',
    description: 'Public URL to the Excel file (.xlsx)',
  })
  @IsUrl()
  @IsNotEmpty()
  @IsString()
  fileUrl!: string;
}
