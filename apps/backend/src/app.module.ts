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
import { DriversModule } from './modules/driver/drivers.module';
import { LocationsModule } from './modules/location/locations.module';
import { DocumentTypesModule } from './modules/document-type/document-types.module';
import { VehicleDocumentsModule } from './modules/vehicle-document/vehicle-documents.module';

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
    DocumentTypesModule,
    VehicleDocumentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
