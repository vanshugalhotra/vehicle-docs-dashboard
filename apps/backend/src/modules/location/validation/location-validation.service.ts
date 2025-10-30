import { Injectable } from '@nestjs/common';
import { BaseValidationService } from 'src/common/validation/base-validation.service';
import { Location } from '@prisma/client';

@Injectable()
export class LocationValidationService {
  constructor(private readonly baseValidation: BaseValidationService) {}

  /**
   * Validate location creation
   */
  async validateCreate(name: string): Promise<void> {
    await this.baseValidation.validateUniqueCaseInsensitive(
      'Location',
      'name',
      name,
      undefined,
      `Location with name "${name}" already exists`,
    );
  }

  /**
   * Validate location update (includes existence check + uniqueness if changing)
   */
  async validateUpdate(id: string, name?: string): Promise<Location> {
    // First validate location exists and get current data
    const location = (await this.baseValidation.validateEntityExists(
      'Location',
      id,
      `Location with id "${id}" not found`,
    )) as Location;

    // Validate uniqueness if name is changing
    if (name && name !== location.name) {
      await this.baseValidation.validateUniqueCaseInsensitive(
        'Location',
        'name',
        name,
        id,
        `Location with name "${name}" already exists`,
      );
    }

    return location;
  }
}
