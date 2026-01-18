import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { LocationValidationService } from './validation/location-validation.service';
import { AuditService } from '../audit/audit.service';

@Module({
  providers: [LocationService, LocationValidationService, AuditService],
  controllers: [LocationController],
})
export class LocationsModule {}
