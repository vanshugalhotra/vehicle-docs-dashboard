import { Module } from '@nestjs/common';
import { VehicleTypeService } from './vehicle-types.service';
import { VehicleTypeController } from './vehicle-types.controller';

@Module({
  controllers: [VehicleTypeController],
  providers: [VehicleTypeService],
})
export class VehicleTypesModule {}
