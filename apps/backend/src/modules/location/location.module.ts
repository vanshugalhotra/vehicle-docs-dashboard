import { Module } from '@nestjs/common';
import { LoggerService } from 'src/common/logger/logger.service';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';

@Module({
  providers: [LocationsService, LoggerService],
  controllers: [LocationsController],
})
export class LocationsModule {}
