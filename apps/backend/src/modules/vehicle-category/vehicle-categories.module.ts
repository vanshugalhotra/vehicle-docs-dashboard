import { Module } from '@nestjs/common';
import { VehicleCategoryService } from './vehicle-category.service';
import { VehicleCategoryController } from './vehicle-category.controller';
@Module({
  controllers: [VehicleCategoryController],
  providers: [VehicleCategoryService],
})
export class VehicleCategoriesModule {}
