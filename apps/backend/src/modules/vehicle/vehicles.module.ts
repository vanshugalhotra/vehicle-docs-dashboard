import { Module } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { VehicleValidationService } from './validation/vehicle-validation.service';

@Module({
  controllers: [VehicleController],
  providers: [VehicleService, VehicleValidationService],
})
export class VehiclesModule {}
