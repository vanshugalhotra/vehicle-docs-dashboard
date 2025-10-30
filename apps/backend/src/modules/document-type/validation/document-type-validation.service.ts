import { Injectable } from '@nestjs/common';
import { BaseValidationService } from 'src/common/validation/base-validation.service';
import { DocumentType } from '@prisma/client';

@Injectable()
export class DocumentTypeValidationService {
  constructor(private readonly baseValidation: BaseValidationService) {}

  /**
   * Validate document type creation
   */
  async validateCreate(name: string): Promise<void> {
    await this.baseValidation.validateUniqueCaseInsensitive(
      'DocumentType',
      'name',
      name,
      undefined,
      `Document type with name "${name}" already exists`,
    );
  }

  /**
   * Validate document type update (includes existence check + uniqueness if changing)
   */
  async validateUpdate(id: string, name?: string): Promise<DocumentType> {
    // First validate document type exists and get current data
    const documentType = (await this.baseValidation.validateEntityExists(
      'DocumentType',
      id,
      `Document type with id "${id}" not found`,
    )) as DocumentType;

    // Validate uniqueness if name is changing
    if (name && name !== documentType.name) {
      await this.baseValidation.validateUniqueCaseInsensitive(
        'DocumentType',
        'name',
        name,
        id,
        `Document type with name "${name}" already exists`,
      );
    }

    return documentType;
  }
}
