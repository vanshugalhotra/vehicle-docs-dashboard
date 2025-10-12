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

    // 1. Handle HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === 'string'
          ? res
          : ((res as Record<string, unknown>)?.['message']?.toString() ??
            message);
    }

    // 2. Handle Prisma errors
    else if (this.isPrismaError(exception)) {
      const prismaErr = exception;
      errorCode = prismaErr.code;
      message = this.extractPrismaMessage(prismaErr);
      status = this.mapPrismaErrorToStatus(prismaErr);
    }

    // 3. Handle generic errors (Error)
    else if (exception instanceof Error) {
      message = exception.message;
    }

    // 4. Fallback: stringify safely
    else if (typeof exception === 'object' && exception !== null) {
      message = JSON.stringify(exception);
    } else if (typeof exception === 'string') {
      message = exception;
    }

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

  private isPrismaError(e: unknown): e is Prisma.PrismaClientKnownRequestError {
    return (
      typeof e === 'object' &&
      e !== null &&
      'code' in e &&
      typeof (e as { code: unknown }).code === 'string'
    );
  }

  private extractPrismaMessage(
    err: Prisma.PrismaClientKnownRequestError,
  ): string {
    if (typeof err.meta?.target === 'string') return err.meta.target;
    if (Array.isArray(err.meta?.target)) return err.meta.target.join(', ');
    return err.message ?? 'Database error';
  }

  private mapPrismaErrorToStatus(
    err: Prisma.PrismaClientKnownRequestError,
  ): HttpStatus {
    switch (err.code) {
      case 'P2002': // Unique constraint
        return HttpStatus.CONFLICT;
      case 'P2025': // Record not found
        return HttpStatus.NOT_FOUND;
      default:
        return HttpStatus.BAD_REQUEST;
    }
  }
}
