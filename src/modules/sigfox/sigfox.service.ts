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
  matchedByMbs?: boolean;
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
   * Extracts bsId values from duplicates array.
   */
  private extractBsIds(duplicates: Array<{ bsId?: string }> | undefined): string[] {
    if (!duplicates || !Array.isArray(duplicates)) {
      return [];
    }
    return duplicates.map((d) => d.bsId).filter((id): id is string => !!id);
  }

  /**
   * Processes incoming Sigfox message and resolves geofence location.
   * Priority: 1) MBS match from duplicates, 2) GPS geofence, 3) In_transit
   */
  async processIncomingMessage(payload: SigfoxPayloadDto): Promise<ProcessingResult> {
    this.logger.log(`Processing geofence for device: ${payload.device}`);

    const bsIds = this.extractBsIds(payload.duplicates);

    if (!payload.computedLocation || payload.computedLocation.status === 0) {
      this.logger.warn(`No valid GPS data for device ${payload.device}`);
      return this.createMbsOrInTransitResult(payload, bsIds);
    }

    const { lat, lng } = payload.computedLocation;
    if (lat === undefined || lng === undefined) {
      this.logger.warn(`Missing lat/lng for device ${payload.device}`);
      return this.createMbsOrInTransitResult(payload, bsIds);
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

    await this.upsertDevice(payload, lat, lng, matchedLocation?.id);

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
   * Attempts MBS match first, falls back to In_transit when no GPS data.
   * Updates device with location GPS and location_id if MBS match found.
   */
  private async createMbsOrInTransitResult(
    payload: SigfoxPayloadDto,
    bsIds: string[],
  ): Promise<ProcessingResult> {
    const mbsLocation = await this.locationService.findByMbs(bsIds);

    if (mbsLocation) {
      this.logger.log(
        `Device ${payload.device} matched MBS location "${mbsLocation.name}" via bsId`,
      );

      const lat = Number(mbsLocation.latitude);
      const lng = Number(mbsLocation.longitude);

      await this.upsertDevice(payload, lat, lng, mbsLocation.id);

      const history = this.historyRepository.create({
        deviceId: payload.device,
        latitude: lat,
        longitude: lng,
        locationId: mbsLocation.id,
        locationName: mbsLocation.name,
        duplicates: payload.duplicates || null,
      });

      await this.historyRepository.save(history);
      this.logger.log(`DeviceLocationHistory saved for device ${payload.device} (MBS match)`);

      return {
        deviceId: payload.device,
        locationName: mbsLocation.name,
        locationId: mbsLocation.id,
        latitude: lat,
        longitude: lng,
        isInTransit: false,
        distanceKm: 0,
        matchedByMbs: true,
      };
    }

    this.logger.log(`No MBS match for device ${payload.device}, marking as In_transit`);
    const inTransitLocation = await this.locationService.findInTransitLocation();

    const history = this.historyRepository.create({
      deviceId: payload.device,
      latitude: 0,
      longitude: 0,
      locationId: inTransitLocation?.id || undefined,
      locationName: 'In_transit',
      duplicates: payload.duplicates || null,
    });

    await this.historyRepository.save(history);

    return {
      deviceId: payload.device,
      locationName: 'In_transit',
      locationId: inTransitLocation?.id || null,
      latitude: 0,
      longitude: 0,
      isInTransit: true,
      distanceKm: null,
    };
  }

  /**
   * Upserts device with GPS coordinates and location_id.
   */
  private async upsertDevice(
    payload: SigfoxPayloadDto,
    lat: number,
    lng: number,
    locationId?: string,
  ): Promise<void> {
    let device = await this.deviceRepository.findOne({
      where: { id: payload.device },
    });

    if (!device) {
      device = this.deviceRepository.create({
        id: payload.device,
        deviceTypeName: payload.deviceType,
        deviceTypeId: payload.deviceTypeId || '',
        status: 'online',
      });
    }

    device.lastLat = lat;
    device.lastLng = lng;
    device.lastSeen = new Date();
    device.locationUpdatedAt = new Date();
    device.locationId = locationId ?? undefined;

    await this.deviceRepository.save(device);
    this.logger.debug(`Device ${payload.device} updated with lat=${lat}, lng=${lng}, locationId=${locationId}`);
  }
}
