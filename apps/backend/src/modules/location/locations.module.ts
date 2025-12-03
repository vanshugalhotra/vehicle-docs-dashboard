import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { LocationValidationService } from './validation/location-validation.service';

@Module({
  providers: [LocationService, LocationValidationService],
  controllers: [LocationController],
})
export class LocationsModule {}
