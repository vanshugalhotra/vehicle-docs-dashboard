import { Injectable, Scope } from '@nestjs/common';
import pino, {
  Logger as PinoLogger,
  DestinationStream,
  StreamEntry,
} from 'pino';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { ConfigService } from 'src/config/config.service';
import createStream, {
  PinoRotatingFileStreamOptions,
} from 'pino-rotating-file-stream';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private readonly logger: PinoLogger;

  constructor(private readonly configService: ConfigService) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const logToFile = this.configService.get('LOG_TO_FILE');
    const logLevel =
      this.configService.get('LOG_LEVEL') || (isProduction ? 'info' : 'debug');

    // Create logs directory if file logging is enabled
    if (logToFile) {
      const logDir = this.configService.get('LOG_DIR') || './logs';
      if (!existsSync(logDir)) {
        mkdirSync(logDir, { recursive: true });
      }
    }

    const pinoConfig = {
      level: logLevel,
      timestamp: pino.stdTimeFunctions.isoTime,
    };

    // Add file streams if enabled
    if (logToFile) {
      const logDir = this.configService.get('LOG_DIR') || './logs';
      const maxSize =
        Number(this.configService.get('LOG_MAX_SIZE') || '10') * 1024 * 1024;
      const retentionDays = Number(
        this.configService.get('LOG_RETENTION_DAYS') || '30',
      );

      // Create streams for different log levels
      const streams: StreamEntry[] = [
        {
          stream: isProduction
            ? process.stdout
            : (pino.transport({
                target: 'pino-pretty',
                options: { colorize: true },
              }) as DestinationStream),
          level: logLevel,
        },
        // File stream for all logs
        {
          stream: this.createFileStream('app', logDir, maxSize, retentionDays),
          level: logLevel,
        },
        // File stream for errors only
        {
          stream: this.createFileStream(
            'error',
            logDir,
            maxSize,
            retentionDays,
          ),
          level: 'error',
        },
      ];

      this.logger = pino(pinoConfig, pino.multistream(streams));
    } else {
      // Original simple logger
      this.logger = pino({
        ...pinoConfig,
        transport: !isProduction
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
      });
    }
  }

  private createFileStream(
    name: string,
    logDir: string,
    maxSizeBytes: number,
    retentionDays: number,
  ): DestinationStream {
    const options: PinoRotatingFileStreamOptions = {
      filename: join(logDir, `${name}.log`),
      path: logDir,
      size: `${maxSizeBytes}B`,
      interval: '1d',
      compress: true,
      maxFiles: Math.ceil(retentionDays * 1.5),
    };
    return createStream(options);
  }

  info(msg: string, meta?: Record<string, unknown>) {
    this.logger.info(meta, msg);
  }

  error(msg: string, meta?: Record<string, unknown>) {
    this.logger.error(meta, msg);
  }

  warn(msg: string, meta?: Record<string, unknown>) {
    this.logger.warn(meta, msg);
  }

  debug(msg: string, meta?: Record<string, unknown>) {
    this.logger.debug(meta, msg);
  }
}
