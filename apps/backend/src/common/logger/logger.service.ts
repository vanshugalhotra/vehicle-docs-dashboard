import { Injectable, Scope } from '@nestjs/common';
import pino, { Logger as PinoLogger } from 'pino';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private readonly logger: PinoLogger;

  constructor() {
    this.logger = pino({
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      timestamp: pino.stdTimeFunctions.isoTime,
    });
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
