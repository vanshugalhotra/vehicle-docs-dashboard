import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception.getResponse?.();
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : ((exceptionResponse as Record<string, unknown>)?.['message'] ??
          'Unexpected error');

    const safeMessage =
      typeof message === 'string' ? message : JSON.stringify(message);

    this.logger.warn(`[${status}] ${safeMessage}`);

    response.status(status).json({
      statusCode: status,
      message: safeMessage,
      timestamp: new Date().toISOString(),
    });
  }
}
