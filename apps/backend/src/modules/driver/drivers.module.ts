import { Module } from '@nestjs/common';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { LoggerService } from 'src/common/logger/logger.service';
import { DriverValidationService } from './validation/driver-validation.service';

@Module({
  controllers: [DriverController],
  providers: [DriverService, LoggerService, DriverValidationService],
  exports: [DriverService],
})
export class DriversModule {}
