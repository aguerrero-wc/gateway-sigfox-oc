import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DevicesService } from './devices.service';
import { Device } from './entities/device.entity';
import { DeviceMessage } from './entities/device-message.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { CreateMessageDto } from './dto/create-message.dto';

describe('DevicesService', () => {
  let service: DevicesService;
  let deviceRepository: jest.Mocked<Repository<Device>>;
  let messageRepository: jest.Mocked<Repository<DeviceMessage>>;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    const mockDeviceRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockMessageRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        getRepository: jest.fn().mockReturnValue(mockDeviceRepo),
      },
    };

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        {
          provide: getRepositoryToken(Device),
          useValue: mockDeviceRepo,
        },
        {
          provide: getRepositoryToken(DeviceMessage),
          useValue: mockMessageRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
    deviceRepository = module.get(getRepositoryToken(Device));
    messageRepository = module.get(getRepositoryToken(DeviceMessage));
    dataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upsertDevice', () => {
    it('should create a new device when it does not exist', async () => {
      const dto: CreateDeviceDto = {
        id: 'new-device',
        deviceTypeName: 'test-type',
        deviceTypeId: 'type-123',
        lastSeen: '2026-01-13T00:00:00Z',
      };

      deviceRepository.findOne.mockResolvedValue(null);
      deviceRepository.create.mockReturnValue({
        id: dto.id,
        deviceTypeName: dto.deviceTypeName,
        deviceTypeId: dto.deviceTypeId,
        lastSeen: new Date(dto.lastSeen!),
      } as Device);
      deviceRepository.save.mockResolvedValue({
        id: dto.id,
        deviceTypeName: dto.deviceTypeName,
        deviceTypeId: dto.deviceTypeId,
        lastSeen: new Date(dto.lastSeen!),
      } as Device);

      const result = await service.upsertDevice(dto);

      expect(deviceRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'new-device' },
      });
      expect(deviceRepository.create).toHaveBeenCalled();
      expect(deviceRepository.save).toHaveBeenCalled();
      expect(result.id).toBe('new-device');
    });

    it('should update existing device when it exists', async () => {
      const dto: CreateDeviceDto = {
        id: 'existing-device',
        deviceTypeName: 'updated-type',
        deviceTypeId: 'type-456',
      };

      const existingDevice: Device = {
        id: 'existing-device',
        deviceTypeName: 'old-type',
        deviceTypeId: 'type-old',
        lastSeen: new Date('2026-01-01T00:00:00Z'),
      } as Device;

      deviceRepository.findOne.mockResolvedValue(existingDevice);
      deviceRepository.save.mockResolvedValue({
        ...existingDevice,
        deviceTypeName: dto.deviceTypeName,
        deviceTypeId: dto.deviceTypeId,
      } as Device);

      const result = await service.upsertDevice(dto);

      expect(deviceRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'existing-device' },
      });
      expect(deviceRepository.create).not.toHaveBeenCalled();
      expect(deviceRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'existing-device',
          deviceTypeName: 'updated-type',
        }),
      );
      expect(result.id).toBe('existing-device');
    });
  });
});
