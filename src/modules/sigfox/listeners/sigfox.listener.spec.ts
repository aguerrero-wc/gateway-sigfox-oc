import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SigfoxListener } from './sigfox.listener';
import { DevicesService } from '../../devices/devices.service';
import { SigfoxPayloadDto } from '../../sigfox/dto/sigfox-payload.dto';
import { SigfoxEventNames } from '../../sigfox/events/sigfox.events';

describe('SigfoxListener', () => {
  let listener: SigfoxListener;
  let devicesService: jest.Mocked<DevicesService>;

  beforeEach(async () => {
    const mockDevicesService = {
      upsertDevice: jest.fn(),
      createMessage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SigfoxListener,
        {
          provide: DevicesService,
          useValue: mockDevicesService,
        },
      ],
    }).compile();

    listener = module.get<SigfoxListener>(SigfoxListener);
    devicesService = module.get(DevicesService);
  });

  it('should be defined', () => {
    expect(listener).toBeDefined();
  });

  describe('handleDataReceived', () => {
    it('should upsert device and create message', async () => {
      const payload: SigfoxPayloadDto = {
        messageType: 'service-data',
        deviceType: 'test-type',
        device: 'DEV001',
        data: 'aabbcc',
      };

      devicesService.upsertDevice.mockResolvedValue({
        id: 'DEV001',
        deviceTypeName: 'test-type',
        deviceTypeId: '',
      } as any);
      devicesService.createMessage.mockResolvedValue({
        id: 'msg-123',
        deviceId: 'DEV001',
      } as any);

      await listener.handleDataReceived(payload);

      expect(devicesService.upsertDevice).toHaveBeenCalledWith({
        id: 'DEV001',
        deviceTypeName: 'test-type',
        deviceTypeId: '',
      });
      expect(devicesService.createMessage).toHaveBeenCalledWith(payload);
    });

    it('should pass computedLocation to createMessage', async () => {
      const payload: SigfoxPayloadDto = {
        messageType: 'service-data-advanced',
        deviceType: 'gps-tracker',
        device: 'GPS001',
        data: 'deadbeef',
        computedLocation: {
          lat: 40.7128,
          lng: -74.006,
          status: 1,
        },
        duplicates: [{ bsId: 'BS01', rssi: -120.5, nbRep: 3 }],
      };

      devicesService.upsertDevice.mockResolvedValue({} as any);
      devicesService.createMessage.mockResolvedValue({} as any);

      await listener.handleDataReceived(payload);

      expect(devicesService.createMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          device: 'GPS001',
          computedLocation: expect.objectContaining({
            lat: 40.7128,
            lng: -74.006,
          }),
        }),
      );
    });

    it('should throw error when processing fails', async () => {
      const payload: SigfoxPayloadDto = {
        messageType: 'service-data',
        deviceType: 'test',
        device: 'ERR001',
        data: 'error',
      };

      devicesService.upsertDevice.mockRejectedValue(new Error('DB error'));

      await expect(listener.handleDataReceived(payload)).rejects.toThrow(
        'DB error',
      );
    });
  });
});
