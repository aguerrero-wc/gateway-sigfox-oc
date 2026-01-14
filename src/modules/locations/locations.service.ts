import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  /**
   * Creates a new location record.
   */
  async create(dto: CreateLocationDto): Promise<Location> {
    this.logger.debug(`Creating location: ${dto.name}`);

    const location = this.locationRepository.create({
      name: dto.name,
      latitude: dto.lat,
      longitude: dto.lng,
      radiusMeters: dto.radiusMeters ?? 0,
    });

    return this.locationRepository.save(location);
  }

  /**
   * Retrieves all locations.
   */
  async findAll(): Promise<Location[]> {
    this.logger.debug('Retrieving all locations');

    return this.locationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}
