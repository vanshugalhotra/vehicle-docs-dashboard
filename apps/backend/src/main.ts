import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Access configuration
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  const nodeEnv = configService.get('NODE_ENV');

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // Global validation pipe (for DTO validation)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: true, // reject unexpected props
      transform: true, // auto-transform to DTO types
    }),
  );

  await app.listen(port);
  logger.log(`🚀 Server running on http://localhost:${port} [${nodeEnv}]`);
}

void bootstrap();
