import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // buffer logs until logger is attached
  });

  // Use ConfigService to get app port
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') ?? 3000;

  // Replace default Nest logger with Pino
  app.useLogger(app.get(Logger));

  await app.listen(port);

  const nodeEnv = configService.get('NODE_ENV');
  app
    .get(Logger)
    .log(`Server running on http://localhost:${port} [${nodeEnv}]`);
}

void bootstrap();
