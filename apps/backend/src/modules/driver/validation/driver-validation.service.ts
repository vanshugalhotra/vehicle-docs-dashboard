import { Injectable } from '@nestjs/common';
import { BaseValidationService } from 'src/common/validation/base-validation.service';
import { Driver } from '@prisma/client';

@Injectable()
export class DriverValidationService {
  constructor(private readonly baseValidation: BaseValidationService) {}

  /**
   * Validate driver creation
   */
  async validateCreate(phone: string, email?: string): Promise<void> {
    // Check unique phone (case-sensitive)
    await this.baseValidation.validateUnique(
      'Driver',
      'phone',
      phone,
      undefined,
      `Driver with phone "${phone}" already exists`,
    );

    // Check unique email if provided (case-insensitive)
    if (email) {
      await this.baseValidation.validateUniqueCaseInsensitive(
        'Driver',
        'email',
        email,
        undefined,
        `Driver with email "${email}" already exists`,
      );
    }
  }

  /**
   * Validate driver update (includes existence check + uniqueness if changing)
   */
  async validateUpdate(
    id: string,
    phone?: string,
    email?: string,
  ): Promise<Driver> {
    // First validate driver exists and get current data
    const driver = (await this.baseValidation.validateEntityExists(
      'Driver',
      id,
      `Driver with id "${id}" not found`,
    )) as Driver;

    // Phone uniqueness check if changed
    if (phone && phone !== driver.phone) {
      await this.baseValidation.validateUnique(
        'Driver',
        'phone',
        phone,
        id,
        `Driver with phone "${phone}" already exists`,
      );
    }

    // Email uniqueness check if changed
    if (email && email !== driver.email) {
      await this.baseValidation.validateUniqueCaseInsensitive(
        'Driver',
        'email',
        email,
        id,
        `Driver with email "${email}" already exists`,
      );
    }

    return driver;
  }
}
