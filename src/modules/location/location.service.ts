import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
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
}
