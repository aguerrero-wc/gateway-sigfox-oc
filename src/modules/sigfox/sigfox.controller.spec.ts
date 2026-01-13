import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SigfoxController } from './sigfox.controller';
import { SigfoxPayloadDto } from './dto/sigfox-payload.dto';
import { SigfoxEventNames } from './events/sigfox.events';

describe('SigfoxController', () => {
  let controller: SigfoxController;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SigfoxController],
      providers: [
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    controller = module.get<SigfoxController>(SigfoxController);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('ingest', () => {
    it('should emit DATA_RECEIVED event and return 201', async () => {
      const payload: SigfoxPayloadDto = {
        messageType: 'service-data-advanced',
        deviceType: 'test-device',
        device: 'TEST123',
        data: 'aabbcc',
        lqi: 'Good',
        operatorName: 'TestOperator',
        countryCode: '123',
        deviceTypeId: 'type-123',
      };

      const result = await controller.ingest(payload);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        SigfoxEventNames.DATA_RECEIVED,
        payload,
      );
      expect(result).toEqual({ status: 'accepted' });
    });

    it('should emit event with full location data', async () => {
      const payload: SigfoxPayloadDto = {
        messageType: 'service-data-advanced',
        deviceType: 'eccotrack',
        device: 'LOC001',
        data: 'deadbeef',
        computedLocation: {
          lat: 44.195847,
          lng: 12.412389,
          radius: 11000,
          source: 2,
          status: 1,
        },
        duplicates: [
          { bsId: 'BS01', rssi: -138.0, nbRep: 2 },
          { bsId: 'BS02', rssi: -142.5, nbRep: 2 },
        ],
      };

      await controller.ingest(payload);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        SigfoxEventNames.DATA_RECEIVED,
        expect.objectContaining({
          device: 'LOC001',
          computedLocation: expect.objectContaining({
            lat: 44.195847,
            lng: 12.412389,
          }),
        }),
      );
    });
  });
});
