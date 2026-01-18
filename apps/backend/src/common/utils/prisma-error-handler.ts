import { Prisma } from '@prisma/client';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

/**
 * Centralized handler to map Prisma errors to NestJS HTTP exceptions
 */
export function handlePrismaError(error: unknown, entityName?: string): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new ConflictException(`${entityName ?? 'Entity'} already exists`);
      case 'P2003':
        throw new ConflictException(
          `Cannot delete ${entityName ?? 'entity'} because it is referenced by another record`,
        );
      case 'P2025':
        throw new NotFoundException(`${entityName ?? 'Entity'} not found`);
      default:
        throw new InternalServerErrorException(
          `Database error: ${error.message}`,
        );
    }
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    const message = error.message.toLowerCase();

    if (
      message.includes('numeric field overflow') ||
      message.includes('22003')
    ) {
      throw new BadRequestException(
        `Invalid ${entityName ?? 'entity'}: value exceeds allowed precision`,
      );
    }

    throw new InternalServerErrorException(
      `Database execution error: ${error.message}`,
    );
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    throw new BadRequestException(`Invalid database query: ${error.message}`);
  } else if (
    error instanceof NotFoundException ||
    error instanceof ConflictException ||
    error instanceof BadRequestException
  ) {
    // allow rethrowing already-handled Nest exceptions (useful for unit tests)
    throw error;
  } else {
    throw new InternalServerErrorException(
      'Unexpected database error occurred',
    );
  }
}
