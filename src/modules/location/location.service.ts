import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import * as XLSX from 'xlsx';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Creates a new static location (geofence / point of interest).
   */
  async create(dto: CreateLocationDto): Promise<Location> {
    this.logger.log(`Creating location: "${dto.name}"`);
    const location = this.locationRepository.create(dto);
    const saved = await this.locationRepository.save(location);
    this.logger.log(`Location created with id: ${saved.id}`);
    return saved;
  }

  /**
   * Returns all locations ordered by creation date descending.
   */
  async findAll(): Promise<Location[]> {
    this.logger.debug('Fetching all locations');
    return this.locationRepository.find({ order: { createdAt: 'DESC' } });
  }

  /**
   * Returns a single location by UUID. Throws NotFoundException if not found.
   */
  async findOne(id: string): Promise<Location> {
    this.logger.debug(`Fetching location id: ${id}`);
    const location = await this.locationRepository.findOne({ where: { id } });
    if (!location) {
      throw new NotFoundException(`Location with id "${id}" not found`);
    }
    return location;
  }

  /**
   * Partially updates an existing location. Throws NotFoundException if not found.
   */
  async update(id: string, dto: UpdateLocationDto): Promise<Location> {
    this.logger.log(`Updating location id: ${id}`);
    const location = await this.findOne(id);
    Object.assign(location, dto);
    const updated = await this.locationRepository.save(location);
    this.logger.log(`Location updated: ${id}`);
    return updated;
  }

  /**
   * Removes a location by UUID. Throws NotFoundException if not found.
   */
  async remove(id: string): Promise<void> {
    this.logger.log(`Removing location id: ${id}`);
    const location = await this.findOne(id);
    await this.locationRepository.remove(location);
    this.logger.log(`Location removed: ${id}`);
  }

  /**
   * Bulk import locations from a CDN-hosted Excel file.
   * Downloads, parses, transforms (EU decimal format), and inserts in chunks.
   */
  async importFromCdn(fileUrl: string): Promise<{ success: boolean; count: number }> {
    this.logger.log(`Fetching Excel from CDN: ${fileUrl}`);

    let response;
    try {
      response = await this.httpService.axiosRef.get(fileUrl, {
        responseType: 'arraybuffer',
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch file from URL: ${fileUrl}. Check if the URL is valid and publicly accessible.`,
      );
    }

    const buffer = Buffer.from(response.data);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet);

    if (rawRows.length === 0) {
      throw new BadRequestException('Excel file is empty or has no valid rows.');
    }

    this.logger.log(`Parsed ${rawRows.length} rows from Excel. Processing...`);

    const locations: Partial<Location>[] = [];
    const chunkSize = 50;

    for (const row of rawRows) {
      if (!row.Name || !row['Lat.'] || !row['Long.']) {
        this.logger.warn(`Skipping row with missing required fields: ${JSON.stringify(row)}`);
        continue;
      }

      const latitude = parseFloat(String(row['Lat.']).replace(',', '.'));
      const longitude = parseFloat(String(row['Long.']).replace(',', '.'));

      if (isNaN(latitude) || isNaN(longitude)) {
        this.logger.warn(`Skipping row with invalid coordinates: ${JSON.stringify(row)}`);
        continue;
      }

      locations.push({
        name: String(row.Name).trim(),
        address: row.Street ? String(row.Street).trim() : undefined,
        city: row.City ? String(row.City).trim() : undefined,
        zip: row.ZIP ? String(row.ZIP).trim() : undefined,
        province: row.Province ? String(row.Province).trim() : undefined,
        country: row.Country ? String(row.Country).trim() : undefined,
        latitude,
        longitude,
        radiusMeters: 100,
        notes: row['Micro BS'] ? String(row['Micro BS']).trim() : undefined,
      });
    }

    if (locations.length === 0) {
      throw new BadRequestException('No valid locations found after parsing Excel.');
    }

    for (let i = 0; i < locations.length; i += chunkSize) {
      const chunk = locations.slice(i, i + chunkSize);
      const entities = this.locationRepository.create(chunk);
      await this.locationRepository.save(entities);
      this.logger.log(`Inserted chunk ${Math.floor(i / chunkSize) + 1}: ${chunk.length} records`);
    }

    this.logger.log(`Bulk import complete: ${locations.length} locations inserted.`);
    return { success: true, count: locations.length };
  }
}
