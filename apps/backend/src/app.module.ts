import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from './common/logger/logger.module';
import { ConfigModule } from './config/config.module';
import { VehiclesModule } from './modules/vehicle/vehicles.module';
import { VehicleCategoriesModule } from './modules/vehicle-category/vehicle-categories.module';
import { VehicleTypesModule } from './modules/vehicle-type/vehicle-types.module';
import { OwnersModule } from './modules/owner/owners.module';
import { DriversModule } from './modules/driver/driver.module';
import { LocationsModule } from './modules/location/location.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    LoggerModule,
    VehiclesModule,
    VehicleCategoriesModule,
    VehicleTypesModule,
    OwnersModule,
    DriversModule,
    LocationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
