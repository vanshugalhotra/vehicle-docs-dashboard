import { Injectable } from '@nestjs/common';
import { BaseValidationService } from 'src/common/validation/base-validation.service';
import { Owner } from '@prisma/client';

@Injectable()
export class OwnerValidationService {
  constructor(private readonly baseValidation: BaseValidationService) {}

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
    const owner = (await this.baseValidation.validateEntityExists(
      'Owner',
      id,
      `Owner with id "${id}" not found`,
    )) as Owner;

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
