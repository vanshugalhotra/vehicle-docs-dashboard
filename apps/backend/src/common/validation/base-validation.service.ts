import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

// Get all Prisma model names dynamically
type PrismaModel = keyof typeof Prisma.ModelName;

// Generic type for Prisma delegate
type PrismaDelegate = {
  findFirst: (args: any) => Promise<any>;
  findUnique: (args: any) => Promise<any>;
};

@Injectable()
export class BaseValidationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validate unique field (case-sensitive)
   */
  async validateUnique(
    model: PrismaModel,
    field: string,
    value: string,
    excludeId?: string,
    customMessage?: string,
  ): Promise<void> {
    const where: Record<string, unknown> = { [field]: value };
    if (excludeId) where.id = { not: excludeId };

    const existing = await this.executePrismaMethod(model, 'findFirst', {
      where,
    });
    if (existing) {
      const entityName = this.getEntityName(model);
      throw new ConflictException(
        customMessage ||
          `${entityName} with ${field} "${value}" already exists`,
      );
    }
  }

  /**
   * Validate unique field (case-insensitive)
   */
  async validateUniqueCaseInsensitive(
    model: PrismaModel,
    field: string,
    value: string,
    excludeId?: string,
    customMessage?: string,
  ): Promise<void> {
    const where: Record<string, unknown> = {
      [field]: { equals: value, mode: 'insensitive' },
    };
    if (excludeId) where.id = { not: excludeId };

    const existing = await this.executePrismaMethod(model, 'findFirst', {
      where,
    });
    if (existing) {
      const entityName = this.getEntityName(model);
      throw new ConflictException(
        customMessage ||
          `${entityName} with ${field} "${value}" already exists`,
      );
    }
  }

  /**
   * Validate entity exists
   */
  async validateEntityExists(
    model: PrismaModel,
    id: string,
    customMessage?: string,
  ): Promise<unknown> {
    const entity = await this.executePrismaMethod(model, 'findUnique', {
      where: { id },
    });
    if (!entity) {
      const entityName = this.getEntityName(model);
      throw new NotFoundException(
        customMessage || `${entityName} with id "${id}" not found`,
      );
    }
    return entity;
  }

  /**
   * Validate multiple unique fields (OR condition)
   */
  async validateMultipleUnique(
    model: PrismaModel,
    fields: Array<{ field: string; value: string; caseInsensitive?: boolean }>,
    excludeId?: string,
    customMessage?: string,
  ): Promise<void> {
    const orConditions = fields.map(({ field, value, caseInsensitive }) => ({
      [field]: caseInsensitive ? { equals: value, mode: 'insensitive' } : value,
    }));

    const where: Record<string, unknown> = { OR: orConditions };
    if (excludeId) where.id = { not: excludeId };

    const existing = await this.executePrismaMethod(model, 'findFirst', {
      where,
    });
    if (existing) {
      const entityName = this.getEntityName(model);
      throw new ConflictException(
        customMessage || `${entityName} with same identifiers already exists`,
      );
    }
  }

  /**
   * Generic Prisma method executor with proper typing
   */
  private async executePrismaMethod(
    model: PrismaModel,
    method: 'findFirst' | 'findUnique',
    args: any,
  ): Promise<unknown> {
    // Type-safe dynamic access to Prisma delegates
    const delegate = this.prisma[model] as PrismaDelegate;
    return delegate[method](args);
  }

  /**
   * Helper to convert model name to entity name
   */
  private getEntityName(model: string): string {
    return model
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }
}
