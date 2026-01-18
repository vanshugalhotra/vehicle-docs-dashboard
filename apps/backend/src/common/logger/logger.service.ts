import { Injectable, Scope } from '@nestjs/common';
import pino, {
  Logger as PinoLogger,
  DestinationStream,
  StreamEntry,
} from 'pino';
import { existsSync, mkdirSync } from 'fs';
import { ConfigService } from 'src/config/config.service';
import createStream, {
  PinoRotatingFileStreamOptions,
} from 'pino-rotating-file-stream';

export interface LogContext {
  entity: string;
  action: string;
  additional?: Record<string, unknown>;
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private readonly logger: PinoLogger;
  private readonly logDetail: boolean;
  private readonly isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isProduction = this.configService.get('NODE_ENV') === 'production';
    const logToFile = this.toBool(this.configService.get('LOG_TO_FILE'));
    this.logDetail = this.toBool(this.configService.get('LOG_DETAIL'));

    const logLevel =
      this.configService.get('LOG_LEVEL') ||
      (this.isProduction ? 'info' : 'debug');

    if (logToFile) {
      const logDir = this.configService.get('LOG_DIR') || './logs';
      if (!existsSync(logDir)) {
        mkdirSync(logDir, { recursive: true });
      }
    }

    const baseConfig = {
      level: logLevel,
      timestamp: pino.stdTimeFunctions.isoTime,
    };

    if (logToFile) {
      const logDir = this.configService.get('LOG_DIR') || './logs';
      const maxSize =
        Number(this.configService.get('LOG_MAX_SIZE') || '10') * 1024 * 1024;
      const retentionDays = Number(
        this.configService.get('LOG_RETENTION_DAYS') || '30',
      );

      const streams: StreamEntry[] = [
        {
          stream: this.createFileStream('app', logDir, maxSize, retentionDays),
          level: logLevel,
        },
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

      if (!this.isProduction) {
        streams.push({
          stream: pino.transport({
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss',
              ignore: 'pid,hostname',
              levelFirst: true,
            },
          }) as DestinationStream,
          level: logLevel,
        });
      }

      this.logger = pino(baseConfig, pino.multistream(streams));
    } else {
      this.logger = pino({
        ...baseConfig,
        transport: !this.isProduction
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname',
                levelFirst: true,
              },
            }
          : undefined,
      });
    }
  }

  private toBool(value: unknown): boolean {
    return value === true || value === 'true';
  }

  private createFileStream(
    name: string,
    logDir: string,
    maxSizeBytes: number,
    retentionDays: number,
  ): DestinationStream {
    const options: PinoRotatingFileStreamOptions = {
      filename: `${name}.log`,
      path: logDir,
      size: `${maxSizeBytes}B`,
      interval: '1d',
      compress: true,
      maxFiles: Math.ceil(retentionDays * 1.5),
    };

    const stream = createStream(options);

    stream.on('error', (err) => {
      console.error(
        `[LOGGER_ERROR] Failed to write ${name}.log`,
        err instanceof Error ? err.message : err,
      );
    });

    return stream;
  }

  /* ---------- Base methods ---------- */

  info(msg: string, meta?: Record<string, unknown>) {
    this.logger.info(meta ?? {}, msg);
  }

  warn(msg: string, meta?: Record<string, unknown>) {
    this.logger.warn(meta ?? {}, msg);
  }

  debug(msg: string, meta?: Record<string, unknown>) {
    this.logger.debug(meta ?? {}, msg);
  }

  error(msg: string, meta?: Record<string, unknown>) {
    this.logger.error(meta ?? {}, msg);
  }

  /* ---------- Context helpers ---------- */

  logInfo(msg: string, context: LogContext) {
    this.logger.info(this.buildInfoContext(context), msg);
  }

  logDebug(msg: string, context: LogContext) {
    this.logger.debug(this.buildDebugContext(context), msg);
  }

  logWarn(msg: string, context: LogContext) {
    this.logger.warn(this.buildInfoContext(context), msg);
  }

  logError(msg: string, context: LogContext, error?: unknown) {
    this.logger.error(
      {
        ...this.buildInfoContext(context),
        err:
          error instanceof Error
            ? error
            : error
              ? {
                  message:
                    typeof error === 'string' ? error : JSON.stringify(error),
                }
              : undefined,
      },
      msg,
    );
  }

  /* ---------- Context builders ---------- */

  // Clean, business-level logs
  private buildInfoContext(context: LogContext) {
    return {
      entity: context.entity,
      action: context.action,
      ...(this.logDetail && context.additional ? context.additional : {}),
    };
  }

  // Detailed, developer-level logs
  private buildDebugContext(context: LogContext) {
    return {
      entity: context.entity,
      action: context.action,
      ...(this.logDetail && context.additional ? context.additional : {}),
    };
  }
}
