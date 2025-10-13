import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from './common/logger/logger.module';
import { LoggerModule as NestLoggerModule } from 'nestjs-pino';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { VehiclesModule } from './modules/vehicle/vehicles.module';
import { VehicleCategoriesModule } from './modules/vehicle-category/vehicle-categories.module';
import { VehicleTypesModule } from './modules/vehicle-type/vehicle-types.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    LoggerModule,
    VehiclesModule,
    VehicleCategoriesModule,
    VehicleTypesModule,
    NestLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get('NODE_ENV') === 'production' ? 'info' : 'debug',
          transport:
            config.get('NODE_ENV') !== 'production'
              ? { target: 'pino-pretty', options: { colorize: true } }
              : undefined,
          timestamp: () => `,"time":"${new Date().toISOString()}"`,
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
