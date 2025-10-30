import { Injectable } from '@nestjs/common';
import { BaseValidationService } from 'src/common/validation/base-validation.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Owner } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class OwnerValidationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly baseValidation: BaseValidationService,
  ) {}

  /**
   * Validate owner creation
   */
  async validateCreate(name: string): Promise<void> {
    await this.baseValidation.validateUniqueCaseInsensitive(
      'Owner',
      'name',
      name,
      undefined,
      `Owner with name "${name}" already exists`,
    );
  }

  /**
   * Validate owner update (includes existence check + uniqueness if changing)
   */
  async validateUpdate(id: string, name?: string): Promise<Owner> {
    // Use Prisma directly for type safety
    const owner = await this.prisma.owner.findUnique({ where: { id } });

    if (!owner) {
      throw new NotFoundException(`Owner with id "${id}" not found`);
    }

    // Validate uniqueness if name is changing
    if (name && name !== owner.name) {
      await this.baseValidation.validateUniqueCaseInsensitive(
        'Owner',
        'name',
        name,
        id,
        `Owner with name "${name}" already exists`,
      );
    }

    return owner;
  }
}
