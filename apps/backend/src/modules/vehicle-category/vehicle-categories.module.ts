import { Module } from '@nestjs/common';
import { VehicleCategoryService } from './vehicle-category.service';
import { VehicleCategoryController } from './vehicle-category.controller';
import { VehicleCategoryValidationService } from './validation/vehicle-category-validation.service';
@Module({
  controllers: [VehicleCategoryController],
  providers: [VehicleCategoryService, VehicleCategoryValidationService],
})
export class VehicleCategoriesModule {}
