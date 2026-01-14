import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('Device-Location Relationship (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create location, create device, assign location, and verify relationship', async () => {
    const locationData = {
      name: 'Sede Central',
      lat: 1.0,
      lng: 1.0,
      radiusMeters: 100,
    };

    const locationResponse = await request(app.getHttpServer())
      .post('/api/v1/locations')
      .send(locationData)
      .expect(201);

    const locationId = locationResponse.body.id;
    expect(locationId).toBeDefined();

    const deviceId = 'TEST01';

    const devicesRepo = dataSource.manager.getRepository('Device');
    const existingDevice = await devicesRepo.findOne({
      where: { id: deviceId },
    });

    if (!existingDevice) {
      await devicesRepo.save(
        devicesRepo.create({
          id: deviceId,
          deviceTypeName: 'test-type',
          deviceTypeId: 'test-id',
          status: 'online',
        }),
      );
    }

    const assignResponse = await request(app.getHttpServer())
      .patch(`/api/v1/devices/${deviceId}/location`)
      .send({ locationId })
      .expect(200);

    expect(assignResponse.body.locationId).toBe(locationId);

    const deviceResponse = await request(app.getHttpServer())
      .get(`/api/v1/devices`)
      .query({ status: undefined });

    expect(
      deviceResponse.body.some((d: any) => d.location)?.location,
    ).toBeDefined();
    const deviceWithLocation = deviceResponse.body.find(
      (d: any) => d.id === deviceId,
    );
    expect(deviceWithLocation).toBeDefined();
    expect(deviceWithLocation.location).toBeDefined();
    expect(deviceWithLocation.location.name).toBe('Sede Central');
    expect(deviceWithLocation.location.latitude).toBe(1.0);
    expect(deviceWithLocation.location.longitude).toBe(1.0);
  });

  it('should handle SET NULL on location deletion', async () => {
    const locationData = {
      name: 'Test Location',
      lat: 2.0,
      lng: 2.0,
      radiusMeters: 50,
    };

    const locationResponse = await request(app.getHttpServer())
      .post('/api/v1/locations')
      .send(locationData)
      .expect(201);

    const locationId = locationResponse.body.id;
    const deviceId = 'TEST02';

    const devicesRepo = dataSource.manager.getRepository('Device');
    const existingDevice = await devicesRepo.findOne({
      where: { id: deviceId },
    });

    if (!existingDevice) {
      await devicesRepo.save(
        devicesRepo.create({
          id: deviceId,
          deviceTypeName: 'test-type',
          deviceTypeId: 'test-id',
          status: 'online',
        }),
      );
    }

    await request(app.getHttpServer())
      .patch(`/api/v1/devices/${deviceId}/location`)
      .send({ locationId })
      .expect(200);

    const devicesRepository = dataSource.manager.getRepository('Device');
    const locationRepository = dataSource.manager.getRepository('Location');

    await locationRepository.delete(locationId);

    const deviceAfterDelete = await devicesRepository.findOne({
      where: { id: deviceId },
      relations: ['location'],
    });

    expect(deviceAfterDelete).not.toBeNull();
    expect(deviceAfterDelete!.location).toBeNull();
    expect(deviceAfterDelete!.locationId).toBeNull();
  });
});
