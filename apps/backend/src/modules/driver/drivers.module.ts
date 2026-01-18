import { Module } from '@nestjs/common';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { DriverValidationService } from './validation/driver-validation.service';
import { AuditService } from '../audit/audit.service';
@Module({
  controllers: [DriverController],
  providers: [DriverService, DriverValidationService, AuditService],
  exports: [DriverService],
})
export class DriversModule {}
