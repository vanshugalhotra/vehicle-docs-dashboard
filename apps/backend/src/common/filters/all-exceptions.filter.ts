import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode: string | undefined;

    /* ---------------- HttpException ---------------- */
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null && 'message' in res) {
        const m = (res as Record<string, unknown>).message;
        message = Array.isArray(m) ? m.join(', ') : String(m);
      }
    } else if (this.isPrismaError(exception)) {
      /* ---------------- Prisma errors ---------------- */
      errorCode = exception.code;
      status = this.mapPrismaErrorToStatus(exception);
      message = this.mapPrismaErrorToMessage(exception);
    } else if (exception instanceof Error) {
      /* ---------------- Generic Error ---------------- */
      // Do NOT leak internal messages in prod
      message = 'Unexpected server error';
    }

    /* ---------------- Logging (full details) ---------------- */
    this.logger.error(
      `[${status}] ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
    });
  }

  /* ---------- Helpers ---------- */

  private isPrismaError(e: unknown): e is Prisma.PrismaClientKnownRequestError {
    return (
      typeof e === 'object' &&
      e !== null &&
      'code' in e &&
      typeof (e as Record<string, unknown>).code === 'string'
    );
  }

  private mapPrismaErrorToStatus(
    err: Prisma.PrismaClientKnownRequestError,
  ): HttpStatus {
    switch (err.code) {
      case 'P2002':
        return HttpStatus.CONFLICT;
      case 'P2025':
        return HttpStatus.NOT_FOUND;
      default:
        return HttpStatus.BAD_REQUEST;
    }
  }

  private mapPrismaErrorToMessage(
    err: Prisma.PrismaClientKnownRequestError,
  ): string {
    switch (err.code) {
      case 'P2002':
        return 'Resource already exists';
      case 'P2025':
        return 'Resource not found';
      default:
        return 'Database operation failed';
    }
  }
}
