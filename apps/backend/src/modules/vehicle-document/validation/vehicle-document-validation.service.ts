import { Injectable, BadRequestException } from '@nestjs/common';
import { BaseValidationService } from 'src/common/validation/base-validation.service';
import { VehicleDocument, Vehicle, DocumentType } from '@prisma/client';

@Injectable()
export class VehicleDocumentValidationService {
  constructor(private readonly baseValidation: BaseValidationService) {}

  /**
   * Validate vehicle document creation
   */
  async validateCreate(
    documentNo: string,
    vehicleId: string,
    documentTypeId: string,
    startDate: Date,
    expiryDate: Date,
  ): Promise<{ vehicle: Vehicle; documentType: DocumentType }> {
    // Validate date range
    this.validateDateRange(startDate, expiryDate);

    // Validate vehicle exists
    const vehicle = (await this.baseValidation.validateEntityExists(
      'Vehicle',
      vehicleId,
      `Vehicle with id ${vehicleId} not found`,
    )) as Vehicle;

    // Validate document type exists
    const documentType = (await this.baseValidation.validateEntityExists(
      'DocumentType',
      documentTypeId,
      `DocumentType with id ${documentTypeId} not found`,
    )) as DocumentType;

    // Check for duplicate document number
    await this.baseValidation.validateUniqueCaseInsensitive(
      'VehicleDocument',
      'documentNo',
      documentNo,
      undefined,
      `Document with number "${documentNo}" already exists`,
    );

    return { vehicle, documentType };
  }

  /**
   * Validate vehicle document update
   */
  async validateUpdate(
    id: string,
    documentNo?: string,
    vehicleId?: string,
    documentTypeId?: string,
    startDate?: Date,
    expiryDate?: Date,
  ): Promise<{
    vehicleDocument: VehicleDocument;
    vehicle?: Vehicle;
    documentType?: DocumentType;
    start?: Date;
    expiry?: Date;
  }> {
    // First validate vehicle document exists
    const vehicleDocument = (await this.baseValidation.validateEntityExists(
      'VehicleDocument',
      id,
      `VehicleDocument with id ${id} not found`,
    )) as VehicleDocument;

    let vehicle: Vehicle | undefined;
    let documentType: DocumentType | undefined;

    // Validate vehicle exists if changing
    if (vehicleId && vehicleId !== vehicleDocument.vehicleId) {
      vehicle = (await this.baseValidation.validateEntityExists(
        'Vehicle',
        vehicleId,
        `Vehicle with id ${vehicleId} not found`,
      )) as Vehicle;
    }

    // Validate document type exists if changing
    if (documentTypeId && documentTypeId !== vehicleDocument.documentTypeId) {
      documentType = (await this.baseValidation.validateEntityExists(
        'DocumentType',
        documentTypeId,
        `DocumentType with id ${documentTypeId} not found`,
      )) as DocumentType;
    }

    // Check for duplicate document number if changing
    if (
      documentNo &&
      documentNo.toUpperCase() !== vehicleDocument.documentNo.toUpperCase()
    ) {
      await this.baseValidation.validateUniqueCaseInsensitive(
        'VehicleDocument',
        'documentNo',
        documentNo,
        id,
        `Document with number "${documentNo}" already exists`,
      );
    }

    // Validate date range if dates are provided
    const start = startDate
      ? new Date(startDate)
      : new Date(vehicleDocument.startDate);
    const expiry = expiryDate
      ? new Date(expiryDate)
      : new Date(vehicleDocument.expiryDate);
    this.validateDateRange(start, expiry);

    return {
      vehicleDocument,
      vehicle,
      documentType,
      start,
      expiry,
    };
  }

  /**
   * Validate date range
   */
  private validateDateRange(startDate: Date, expiryDate: Date): void {
    if (isNaN(startDate.getTime()) || isNaN(expiryDate.getTime())) {
      throw new BadRequestException('Invalid startDate or expiryDate');
    }
    if (startDate >= expiryDate) {
      throw new BadRequestException('startDate must be before expiryDate');
    }
  }
}
