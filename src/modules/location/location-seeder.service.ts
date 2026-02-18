import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';

const SEED_LOCATIONS: Partial<Location>[] = [
  {
    name: 'Warehouse North',
    address: 'Calle de Alcalá 120',
    city: 'Madrid',
    province: 'Community of Madrid',
    country: 'Spain',
    zip: '28009',
    latitude: 40.4237,
    longitude: -3.6826,
    radiusMeters: 200,
    notes: 'Main northern distribution warehouse',
    clientId: 'a1b2c3d4-0001-4000-8000-000000000001',
  },
  {
    name: 'Logistics Hub South',
    address: 'Avenida de Andalucía 45',
    city: 'Madrid',
    province: 'Community of Madrid',
    country: 'Spain',
    zip: '28041',
    latitude: 40.3756,
    longitude: -3.7024,
    radiusMeters: 350,
    notes: 'Secondary logistics hub — cold chain certified',
    clientId: 'a1b2c3d4-0001-4000-8000-000000000001',
  },
  {
    name: 'Office HQ',
    address: 'Gran Vía 28',
    city: 'Madrid',
    province: 'Community of Madrid',
    country: 'Spain',
    zip: '28013',
    latitude: 40.4200,
    longitude: -3.7025,
    radiusMeters: 50,
    notes: 'Corporate headquarters — restricted access',
    clientId: 'a1b2c3d4-0001-4000-8000-000000000002',
  },
  {
    name: 'Port Terminal Barcelona',
    address: 'Moll de la Barceloneta s/n',
    city: 'Barcelona',
    province: 'Catalonia',
    country: 'Spain',
    zip: '08039',
    latitude: 41.3748,
    longitude: 2.1734,
    radiusMeters: 500,
    notes: 'Maritime container terminal — 24h operations',
    clientId: 'a1b2c3d4-0001-4000-8000-000000000002',
  },
  {
    name: 'Cold Storage Zaragoza',
    address: 'Polígono Cogullada, Nave 7',
    city: 'Zaragoza',
    province: 'Aragon',
    country: 'Spain',
    zip: '50014',
    latitude: 41.6765,
    longitude: -0.9057,
    radiusMeters: 250,
    notes: 'Refrigerated storage — temperature monitored',
    clientId: 'a1b2c3d4-0001-4000-8000-000000000003',
  },
  {
    name: 'Distribution Center Bogotá',
    address: 'Carrera 30 # 17-55',
    city: 'Bogotá',
    province: 'Cundinamarca',
    country: 'Colombia',
    zip: '111321',
    latitude: 4.6097,
    longitude: -74.0817,
    radiusMeters: 300,
    notes: 'Primary LATAM distribution node',
    clientId: 'a1b2c3d4-0001-4000-8000-000000000004',
  },
  {
    name: 'Depot Medellín',
    address: 'Calle 10 # 43D-20, El Poblado',
    city: 'Medellín',
    province: 'Antioquia',
    country: 'Colombia',
    zip: '050021',
    latitude: 6.2088,
    longitude: -75.5740,
    radiusMeters: 150,
    notes: 'Regional depot — Antioquia coverage',
    clientId: 'a1b2c3d4-0001-4000-8000-000000000004',
  },
  {
    name: 'Airport Cargo Rome',
    address: 'Aeroporto Leonardo da Vinci, Cargo Area',
    city: 'Fiumicino',
    province: 'Lazio',
    country: 'Italy',
    zip: '00054',
    latitude: 41.8003,
    longitude: 12.2388,
    radiusMeters: 400,
    notes: 'Air freight intake — customs bonded zone',
    clientId: 'a1b2c3d4-0001-4000-8000-000000000005',
  },
  {
    name: 'Warehouse Milan East',
    address: 'Via Cassanese 224',
    city: 'Segrate',
    province: 'Lombardy',
    country: 'Italy',
    zip: '20054',
    latitude: 45.4913,
    longitude: 9.2744,
    radiusMeters: 200,
    notes: 'E-commerce fulfilment centre',
    clientId: 'a1b2c3d4-0001-4000-8000-000000000005',
  },
  {
    name: 'Checkpoint Valencia Port',
    address: 'Muelle de Levante s/n',
    city: 'Valencia',
    province: 'Valencian Community',
    country: 'Spain',
    zip: '46024',
    latitude: 39.4515,
    longitude: -0.3189,
    radiusMeters: 600,
    notes: 'Mediterranean gateway — import/export checkpoint',
    clientId: 'a1b2c3d4-0001-4000-8000-000000000003',
  },
];

@Injectable()
export class LocationSeederService {
  private readonly logger = new Logger(LocationSeederService.name);

  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  /**
   * Seeds the database with 10 realistic static locations.
   * Skips seeding if records already exist to prevent duplicates.
   */
  async seed(): Promise<{ seeded: number; skipped: boolean }> {
    const existing = await this.locationRepository.count();

    if (existing > 0) {
      this.logger.warn(
        `Seeder skipped — ${existing} location(s) already exist in the database.`,
      );
      return { seeded: 0, skipped: true };
    }

    this.logger.log(`Seeding ${SEED_LOCATIONS.length} locations...`);
    const entities = this.locationRepository.create(SEED_LOCATIONS);
    await this.locationRepository.save(entities);
    this.logger.log(`Seeding complete — ${SEED_LOCATIONS.length} locations inserted.`);

    return { seeded: SEED_LOCATIONS.length, skipped: false };
  }
}
