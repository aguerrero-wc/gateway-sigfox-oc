import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationService, GeoPoint, GeofenceResult } from '../location/location.service';
import { DeviceLocationHistory } from '../devices/entities/device-location-history.entity';
import { Device } from '../devices/entities/device.entity';
import { Location } from '../location/entities/location.entity';
import { SigfoxPayloadDto } from './dto/sigfox-payload.dto';

export interface GeofenceMatch {
  location: Location;
  distanceKm: number;
}

export interface ProcessingResult {
  deviceId: string;
  locationName: string;
  locationId: string | null;
  latitude: number;
  longitude: number;
  isInTransit: boolean;
  distanceKm: number | null;
}

@Injectable()
export class SigfoxService {
  private readonly logger = new Logger(SigfoxService.name);

  constructor(
    private readonly locationService: LocationService,
    @InjectRepository(DeviceLocationHistory)
    private readonly historyRepository: Repository<DeviceLocationHistory>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  /**
   * Processes incoming Sigfox message and resolves geofence location.
   * Creates a DeviceLocationHistory record with the matched location.
   */
  async processIncomingMessage(payload: SigfoxPayloadDto): Promise<ProcessingResult> {
    this.logger.log(`Processing geofence for device: ${payload.device}`);

    if (!payload.computedLocation || payload.computedLocation.status === 0) {
      this.logger.warn(`No valid location data for device ${payload.device}`);
      return this.createInTransitResult(payload);
    }

    const { lat, lng } = payload.computedLocation;
    if (lat === undefined || lng === undefined) {
      this.logger.warn(`Missing lat/lng for device ${payload.device}`);
      return this.createInTransitResult(payload);
    }

    const device = await this.deviceRepository.findOne({
      where: { id: payload.device },
    });

    if (!device) {
      this.logger.log(`Device ${payload.device} not found, creating...`);
      await this.deviceRepository.save(
        this.deviceRepository.create({
          id: payload.device,
          deviceTypeName: payload.deviceType,
          deviceTypeId: payload.deviceTypeId || '',
          lastSeen: new Date(),
          status: 'online',
        }),
      );
    }

    const devicePoint: GeoPoint = { lat, lng };
    const locations = await this.locationService.findAllForGeofencing();

    this.logger.debug(`Checking ${locations.length} locations for geofence match`);

    const matches: GeofenceMatch[] = [];

    for (const location of locations) {
      if (!location.radiusMeters) {
        continue;
      }

      const center: GeoPoint = {
        lat: Number(location.latitude),
        lng: Number(location.longitude),
      };

      const result: GeofenceResult = this.locationService.isPointInRadius(
        devicePoint,
        center,
        location.radiusMeters,
      );

      if (result.isInside) {
        matches.push({
          location,
          distanceKm: result.distanceKm,
        });
      }
    }

    let matchedLocation: Location | null = null;
    let matchedDistanceKm: number | null = null;

    if (matches.length > 0) {
      matches.sort((a, b) => a.distanceKm - b.distanceKm);
      matchedLocation = matches[0].location;
      matchedDistanceKm = matches[0].distanceKm;
      this.logger.log(
        `Device ${payload.device} matched location "${matchedLocation.name}" at ${matchedDistanceKm.toFixed(3)} km`,
      );
    } else {
      this.logger.log(`Device ${payload.device} is In_transit (no location match)`);
      const inTransitLocation = await this.locationService.findInTransitLocation();
      if (inTransitLocation) {
        matchedLocation = inTransitLocation;
      }
    }

    const history = this.historyRepository.create({
      deviceId: payload.device,
      latitude: lat,
      longitude: lng,
      locationId: matchedLocation?.id || undefined,
      locationName: matchedLocation?.name || 'In_transit',
      duplicates: payload.duplicates || null,
    });

    await this.historyRepository.save(history);
    this.logger.log(`DeviceLocationHistory saved for device ${payload.device}`);

    const isInTransit = matchedLocation?.name === 'In_transit';

    return {
      deviceId: payload.device,
      locationName: matchedLocation?.name || 'In_transit',
      locationId: matchedLocation?.id || null,
      latitude: lat,
      longitude: lng,
      isInTransit,
      distanceKm: isInTransit ? null : matchedDistanceKm,
    };
  }

  /**
   * Creates an In_transit result when no valid location data is available.
   */
  private async createInTransitResult(payload: SigfoxPayloadDto): Promise<ProcessingResult> {
    const lat = payload.computedLocation?.lat || 0;
    const lng = payload.computedLocation?.lng || 0;

    const inTransitLocation = await this.locationService.findInTransitLocation();

    const history = this.historyRepository.create({
      deviceId: payload.device,
      latitude: lat,
      longitude: lng,
      locationId: inTransitLocation?.id || undefined,
      locationName: 'In_transit',
      duplicates: payload.duplicates || null,
    });

    await this.historyRepository.save(history);

    return {
      deviceId: payload.device,
      locationName: 'In_transit',
      locationId: inTransitLocation?.id || null,
      latitude: lat,
      longitude: lng,
      isInTransit: true,
      distanceKm: null,
    };
  }
}
