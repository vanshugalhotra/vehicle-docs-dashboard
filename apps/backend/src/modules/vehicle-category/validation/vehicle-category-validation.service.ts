import { Injectable } from '@nestjs/common';
import { BaseValidationService } from 'src/common/validation/base-validation.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { VehicleCategory } from '@prisma/client';

@Injectable()
export class VehicleCategoryValidationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly baseValidation: BaseValidationService,
  ) {}

  /**
   * Validate vehicle category creation
   */
  async validateCreate(name: string): Promise<void> {
    await this.baseValidation.validateUniqueCaseInsensitive(
      'VehicleCategory',
      'name',
      name,
      undefined,
      `Vehicle category with name "${name}" already exists`,
    );
  }

  /**
   * Validate vehicle category update (includes existence check + uniqueness if changing)
   */
  async validateUpdate(id: string, name?: string): Promise<VehicleCategory> {
    // First validate vehicle category exists and get current data
    const category = (await this.baseValidation.validateEntityExists(
      'VehicleCategory',
      id,
      `Vehicle category with id "${id}" not found`,
    )) as VehicleCategory;

    // Validate uniqueness if name is changing
    if (name && name !== category.name) {
      await this.baseValidation.validateUniqueCaseInsensitive(
        'VehicleCategory',
        'name',
        name,
        id,
        `Vehicle category with name "${name}" already exists`,
      );
    }

    return category;
  }
}
