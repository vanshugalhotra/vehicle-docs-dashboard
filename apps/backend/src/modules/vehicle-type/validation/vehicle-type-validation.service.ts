import { Injectable, ConflictException } from '@nestjs/common';
import { BaseValidationService } from 'src/common/validation/base-validation.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { VehicleType, VehicleCategory } from '@prisma/client';

@Injectable()
export class VehicleTypeValidationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly baseValidation: BaseValidationService,
  ) {}

  /**
   * Validate vehicle type creation
   */
  async validateCreate(
    name: string,
    categoryId: string,
  ): Promise<VehicleCategory> {
    // Validate category exists using base service
    const category = (await this.baseValidation.validateEntityExists(
      'VehicleCategory',
      categoryId,
      `Vehicle category with id "${categoryId}" not found`,
    )) as VehicleCategory;

    // Check for duplicate vehicle type name within the same category
    // This needs custom logic since it's a composite check (name + category)
    const existing = await this.prisma.vehicleType.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        categoryId: categoryId,
      },
    });
    if (existing) {
      throw new ConflictException(
        `Vehicle type "${name}" already exists under this category`,
      );
    }

    return category;
  }

  /**
   * Validate vehicle type update
   */
  async validateUpdate(
    id: string,
    name?: string,
    categoryId?: string,
  ): Promise<{ vehicleType: VehicleType; category?: VehicleCategory }> {
    // First validate vehicle type exists using base service
    const vehicleType = (await this.baseValidation.validateEntityExists(
      'VehicleType',
      id,
      `Vehicle type with id "${id}" not found`,
    )) as VehicleType;

    const targetCategoryId = categoryId ?? vehicleType.categoryId;
    const targetName = name ?? vehicleType.name;

    let category: VehicleCategory | undefined;

    // If category is being changed, validate it exists using base service
    if (categoryId) {
      category = (await this.baseValidation.validateEntityExists(
        'VehicleCategory',
        targetCategoryId,
        `Vehicle category with id "${targetCategoryId}" not found`,
      )) as VehicleCategory;
    }

    // Check for duplicates if name or category is changing
    // This needs custom logic since it's a composite check (name + category)
    if (name || categoryId) {
      const duplicate = await this.prisma.vehicleType.findFirst({
        where: {
          id: { not: id },
          name: { equals: targetName, mode: 'insensitive' },
          categoryId: targetCategoryId,
        },
      });
      if (duplicate) {
        throw new ConflictException(
          `Vehicle type "${targetName}" already exists under this category`,
        );
      }
    }

    return { vehicleType, category };
  }
}
