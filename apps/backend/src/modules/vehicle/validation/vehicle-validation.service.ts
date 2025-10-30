import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { BaseValidationService } from 'src/common/validation/base-validation.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Vehicle, VehicleCategory, VehicleType } from '@prisma/client';

@Injectable()
export class VehicleValidationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly baseValidation: BaseValidationService,
  ) {}

  /**
   * Validate vehicle creation
   */
  async validateCreate(
    licensePlate: string,
    rcNumber: string,
    chassisNumber: string,
    engineNumber: string,
    categoryId: string,
    typeId: string,
  ): Promise<void> {
    // Check for duplicate identifiers using multiple unique fields
    await this.baseValidation.validateMultipleUnique(
      'Vehicle',
      [
        { field: 'licensePlate', value: licensePlate, caseInsensitive: true },
        { field: 'rcNumber', value: rcNumber, caseInsensitive: true },
        { field: 'chassisNumber', value: chassisNumber, caseInsensitive: true },
        { field: 'engineNumber', value: engineNumber, caseInsensitive: true },
      ],
      undefined,
      'Vehicle with same identifiers already exists',
    );

    // Validate category and type existence and relationship
    await this.validateCategoryTypeRelationship(categoryId, typeId);
  }

  /**
   * Validate vehicle update
   */
  async validateUpdate(
    id: string,
    licensePlate?: string,
    rcNumber?: string,
    chassisNumber?: string,
    engineNumber?: string,
    categoryId?: string,
    typeId?: string,
  ): Promise<{
    vehicle: Vehicle;
    category?: VehicleCategory;
    type?: VehicleType;
  }> {
    // First validate vehicle exists
    const vehicle = (await this.baseValidation.validateEntityExists(
      'Vehicle',
      id,
      `Vehicle with id "${id}" not found`,
    )) as Vehicle;

    // Check for duplicate identifiers if any fields are being updated
    if (licensePlate || rcNumber || chassisNumber || engineNumber) {
      const fields: Array<{
        field: string;
        value: string;
        caseInsensitive?: boolean;
      }> = [];

      if (licensePlate)
        fields.push({
          field: 'licensePlate',
          value: licensePlate,
          caseInsensitive: true,
        });
      if (rcNumber)
        fields.push({
          field: 'rcNumber',
          value: rcNumber,
          caseInsensitive: true,
        });
      if (chassisNumber)
        fields.push({
          field: 'chassisNumber',
          value: chassisNumber,
          caseInsensitive: true,
        });
      if (engineNumber)
        fields.push({
          field: 'engineNumber',
          value: engineNumber,
          caseInsensitive: true,
        });

      if (fields.length > 0) {
        await this.baseValidation.validateMultipleUnique(
          'Vehicle',
          fields,
          id,
          'Another vehicle with same identifiers exists',
        );
      }
    }

    let category: VehicleCategory | undefined;
    let type: VehicleType | undefined;

    // Validate category-type relationship if either is being updated
    if (categoryId || typeId) {
      const finalCategoryId = categoryId ?? vehicle.categoryId;
      const finalTypeId = typeId ?? vehicle.typeId;

      const result = await this.validateCategoryTypeRelationship(
        finalCategoryId,
        finalTypeId,
      );
      category = result.category;
      type = result.type;
    }

    return { vehicle, category, type };
  }

  /**
   * Validate category-type relationship and return entities
   */
  private async validateCategoryTypeRelationship(
    categoryId: string,
    typeId: string,
  ): Promise<{ category: VehicleCategory; type: VehicleType }> {
    // Validate category exists
    const category = await this.prisma.vehicleCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Validate type exists
    const type = await this.prisma.vehicleType.findUnique({
      where: { id: typeId },
    });
    if (!type) {
      throw new NotFoundException('Type not found');
    }

    // Validate type belongs to category
    if (type.categoryId !== categoryId) {
      throw new ConflictException(
        `Vehicle type "${type.name}" does not belong to category "${category.name}"`,
      );
    }

    return { category, type };
  }
}
