import { Injectable } from '@nestjs/common';
import { BaseValidationService } from 'src/common/validation/base-validation.service';
import { ReminderRecipient } from '@prisma/client';

@Injectable()
export class ReminderValidationService {
  constructor(private readonly baseValidation: BaseValidationService) {}

  /**
   * Validate reminder recipient creation
   */
  async validateRecipientCreate(email: string): Promise<void> {
    await this.baseValidation.validateUniqueCaseInsensitive(
      'ReminderRecipient',
      'email',
      email,
      undefined,
      `Reminder recipient with email "${email}" already exists`,
    );
  }

  /**
   * Validate reminder recipient update
   */
  async validateRecipientUpdate(
    id: string,
    email?: string,
  ): Promise<ReminderRecipient> {
    const recipient = (await this.baseValidation.validateEntityExists(
      'ReminderRecipient',
      id,
      `Reminder recipient with id "${id}" not found`,
    )) as ReminderRecipient;

    if (email && email !== recipient.email) {
      await this.baseValidation.validateUniqueCaseInsensitive(
        'ReminderRecipient',
        'email',
        email,
        id,
        `Reminder recipient with email "${email}" already exists`,
      );
    }

    return recipient;
  }
}
