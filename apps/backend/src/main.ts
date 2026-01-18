import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { LoggerService } from './common/logger/logger.service';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import * as crypto from 'crypto';
import helmet from 'helmet';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') ?? 3000;
  const nodeEnv = configService.get('NODE_ENV') ?? 'development';

  // ----------------------
  // Core Security
  // ----------------------
  app.use(helmet());

  app.use(cookieParser());

  // Body limit
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Request ID
  app.use(
    (
      req: express.Request & { id?: string },
      res: express.Response,
      next: express.NextFunction,
    ) => {
      req.id = (req.headers['x-request-id'] as string) || crypto.randomUUID();
      res.setHeader('x-request-id', req.id);
      next();
    },
  );
  // ----------------------
  // Versioning
  // ----------------------
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // ----------------------
  // CORS
  // ----------------------
  const allowedOrigins = configService.get('ALLOWED_ORIGINS')?.split(',') || [];
  if (!allowedOrigins.length) {
    throw new Error('ALLOWED_ORIGINS not configured');
  }

  app.enableCors({
    origin: allowedOrigins.length ? allowedOrigins : 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
  });

  // ----------------------
  // Logging Middleware
  // ----------------------
  const logger = await app.resolve(LoggerService);
  app.use(new LoggingMiddleware(logger).use);

  // ----------------------
  // Validation
  // ----------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ----------------------
  // Exception Filter
  // ----------------------
  app.useGlobalFilters(new AllExceptionsFilter());

  // ----------------------
  // Prefix
  // ----------------------
  app.setGlobalPrefix('api');

  // ----------------------
  // Swagger (disabled in prod)
  // ----------------------
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vehicle Docs Dashboard API')
    .setDescription('API documentation for Vehicle Docs Dashboard')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  if (nodeEnv !== 'production') {
    SwaggerModule.setup('api/docs', app, document);
  }

  // ----------------------
  // Graceful shutdown
  // ----------------------
  app.enableShutdownHooks();

  await app.listen(port);
  console.log(`Server running on http://localhost:${port} [${nodeEnv}]`);
}

void bootstrap();
