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
export function handlePrismaError(error: unknown, entityName?: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint failed
        throw new ConflictException(`${entityName ?? 'Entity'} already exists`);
      case 'P2003': // Foreign key constraint failed
        throw new ConflictException(
          `Cannot delete ${entityName ?? 'entity'} because it is referenced by another record`,
        );
      case 'P2025': // Record not found for update/delete
        throw new NotFoundException(`${entityName ?? 'Entity'} not found`);
      default:
        throw new InternalServerErrorException(
          `Database error: ${error.message}`,
        );
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    throw new BadRequestException(`Invalid database query: ${error.message}`);
  } else {
    // fallback for unexpected errors
    throw new InternalServerErrorException('Unexpected error occurred');
  }
}
