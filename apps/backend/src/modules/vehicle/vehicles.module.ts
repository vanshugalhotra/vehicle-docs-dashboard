import { Module } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { VehicleValidationService } from './validation/vehicle-validation.service';
import { AuditService } from '../audit/audit.service';

@Module({
  controllers: [VehicleController],
  providers: [VehicleService, VehicleValidationService, AuditService],
})
export class VehiclesModule {}
