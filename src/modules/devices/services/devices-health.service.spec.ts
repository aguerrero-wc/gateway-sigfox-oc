import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DevicesHealthService } from './devices-health.service';
import { Device } from '../entities/device.entity';

describe('DevicesHealthService', () => {
  let service: DevicesHealthService;
  let deviceRepository: jest.Mocked<Repository<Device>>;

  beforeEach(async () => {
    const mockRepository = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesHealthService,
        {
          provide: getRepositoryToken(Device),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DevicesHealthService>(DevicesHealthService);
    deviceRepository = module.get(getRepositoryToken(Device));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateOfflineDevices', () => {
    it('should update devices not seen in 24 hours to offline', async () => {
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 5 }),
      };

      deviceRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.updateOfflineDevices();

      expect(deviceRepository.createQueryBuilder).toHaveBeenCalledWith(
        'device',
      );
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(Device);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({ status: 'offline' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'status = :onlineStatus',
        { onlineStatus: 'online' },
      );
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });

    it('should log number of updated devices', async () => {
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 3 }),
      };

      deviceRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.updateOfflineDevices();

      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });

    it('should handle case with no devices to update', async () => {
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      };

      deviceRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.updateOfflineDevices();

      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });
  });
});
