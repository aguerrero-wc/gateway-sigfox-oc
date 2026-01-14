import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationsService } from './locations.service';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';

describe('LocationsService', () => {
  let service: LocationsService;
  let locationRepository: jest.Mocked<Repository<Location>>;

  beforeEach(async () => {
    const mockLocationRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        {
          provide: getRepositoryToken(Location),
          useValue: mockLocationRepo,
        },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
    locationRepository = module.get(getRepositoryToken(Location));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a location', async () => {
      const dto: CreateLocationDto = {
        name: 'Main Office',
        lat: 44.195847,
        lng: 12.412389,
        radiusMeters: 100,
      };

      const savedLocation: Location = {
        id: 'uuid-123',
        name: 'Main Office',
        latitude: 44.195847,
        longitude: 12.412389,
        radiusMeters: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Location;

      locationRepository.create.mockReturnValue(savedLocation);
      locationRepository.save.mockResolvedValue(savedLocation);

      const result = await service.create(dto);

      expect(locationRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        latitude: dto.lat,
        longitude: dto.lng,
        radiusMeters: dto.radiusMeters,
      });
      expect(locationRepository.save).toHaveBeenCalled();
      expect(result.id).toBe('uuid-123');
      expect(result.name).toBe('Main Office');
    });
  });

  describe('findAll', () => {
    it('should return an array of locations', async () => {
      const locations: Location[] = [
        {
          id: 'uuid-1',
          name: 'Location 1',
          latitude: 44.0,
          longitude: 12.0,
          radiusMeters: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Location,
        {
          id: 'uuid-2',
          name: 'Location 2',
          latitude: 45.0,
          longitude: 13.0,
          radiusMeters: 75,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Location,
      ];

      locationRepository.find.mockResolvedValue(locations);

      const result = await service.findAll();

      expect(locationRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Location 1');
    });
  });
});
