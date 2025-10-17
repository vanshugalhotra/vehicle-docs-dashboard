import { Module } from '@nestjs/common';
import { VehicleCategoryService } from './vehicle-categories.service';
import { VehicleCategoryController } from './vehicle-categories.controller';
@Module({
  controllers: [VehicleCategoryController],
  providers: [VehicleCategoryService],
})
export class VehicleCategoriesModule {}
