import { Module } from '@nestjs/common';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { LoggerService } from 'src/common/logger/logger.service';

@Module({
  controllers: [DriversController],
  providers: [DriversService, LoggerService],
  exports: [DriversService],
})
export class DriversModule {}
