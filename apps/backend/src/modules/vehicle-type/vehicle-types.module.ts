import { Module } from '@nestjs/common';
import { VehicleTypeService } from './vehicle-type.service';
import { VehicleTypeController } from './vehicle-type.controller';
import { VehicleTypeValidationService } from './validation/vehicle-type-validation.service';

@Module({
  controllers: [VehicleTypeController],
  providers: [VehicleTypeService, VehicleTypeValidationService],
})
export class VehicleTypesModule {}
