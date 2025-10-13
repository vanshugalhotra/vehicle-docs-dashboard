import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from 'src/common/logger/logger.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
      const ms = Date.now() - start;
      this.logger.info(
        `${req.method} - ${req.originalUrl} - ${res.statusCode} - ${ms}ms`,
      );
    });

    next();
  };
}
