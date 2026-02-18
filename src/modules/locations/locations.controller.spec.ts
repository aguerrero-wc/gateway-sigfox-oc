import { Test, TestingModule } from '@nestjs/testing';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';

describe('LocationsController', () => {
  let controller: LocationsController;
  let locationsService: jest.Mocked<LocationsService>;

  beforeEach(async () => {
    const mockLocationsService = {
      create: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationsController],
      providers: [
        {
          provide: LocationsService,
          useValue: mockLocationsService,
        },
      ],
    }).compile();

    controller = module.get<LocationsController>(LocationsController);
    locationsService = module.get(LocationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a location', async () => {
      const dto = { name: 'Test', lat: 44.0, lng: 12.0, radiusMeters: 50 };
      const result = {
        id: 'uuid',
        name: 'Test',
        latitude: 44.0,
        longitude: 12.0,
        radiusMeters: 50,
        devices: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      locationsService.create.mockResolvedValue(result as any);

      expect(await controller.create(dto)).toBe(result);
      expect(locationsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of locations', async () => {
      const result = [
        {
          id: 'uuid-1',
          name: 'Loc1',
          latitude: 44.0,
          longitude: 12.0,
          radiusMeters: 50,
          devices: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'uuid-2',
          name: 'Loc2',
          latitude: 45.0,
          longitude: 13.0,
          radiusMeters: 75,
          devices: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      locationsService.findAll.mockResolvedValue(result as any);

      expect(await controller.findAll()).toBe(result);
      expect(locationsService.findAll).toHaveBeenCalled();
    });
  });
});
