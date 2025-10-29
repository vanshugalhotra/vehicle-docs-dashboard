import { Module } from '@nestjs/common';
import { LoggerService } from 'src/common/logger/logger.service';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';

@Module({
  providers: [LocationService, LoggerService],
  controllers: [LocationController],
})
export class LocationsModule {}
