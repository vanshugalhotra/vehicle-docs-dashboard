import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // buffer logs until logger is attached
  });

  // Use ConfigService to get app port
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') ?? 3000;

  // Replace default Nest logger with Pino
  app.useLogger(app.get(Logger));

  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI, // Version in URL: /v1/vehicles
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global API prefix
  app.setGlobalPrefix('api');

  // ----------------------------
  // Swagger / OpenAPI setup
  // ----------------------------
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vehicle Docs Dashboard API')
    .setDescription('API documentation for Vehicle Docs Dashboard')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document); // Accessible at /api/docs

  // Start the app
  await app.listen(port);

  const nodeEnv = configService.get('NODE_ENV');
  app
    .get(Logger)
    .log(`Server running on http://localhost:${port} [${nodeEnv}]`);
}

void bootstrap();
