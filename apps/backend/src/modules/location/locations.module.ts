import { Module } from '@nestjs/common';
import { LoggerService } from 'src/common/logger/logger.service';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { LocationValidationService } from './validation/location-validation.service';

@Module({
  providers: [LocationService, LoggerService, LocationValidationService],
  controllers: [LocationController],
})
export class LocationsModule {}
