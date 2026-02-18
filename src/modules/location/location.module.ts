import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Location } from './entities/location.entity';
import { LocationService } from './location.service';
import { LocationSeederService } from './location-seeder.service';
import { LocationController } from './location.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Location]), HttpModule],
  providers: [LocationService, LocationSeederService],
  controllers: [LocationController],
  exports: [LocationService],
})
export class LocationModule {}
