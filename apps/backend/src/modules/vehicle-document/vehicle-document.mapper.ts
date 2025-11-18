import { VehicleDocument, Vehicle, DocumentType } from '@prisma/client';
import { VehicleDocumentResponseDto } from './dto/vehicle-document-response.dto';

type VehicleDocumentWithRelations = VehicleDocument & {
  vehicle?: Vehicle | null;
  documentType?: DocumentType | null;
};

export function mapVehicleDocumentToResponse(
  doc: VehicleDocumentWithRelations,
): VehicleDocumentResponseDto {
  const today = new Date();
  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (new Date(doc.expiryDate).getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );

  return {
    id: doc.id,
    documentNo: doc.documentNo,
    documentTypeName: doc.documentType?.name ?? 'Unknown',
    vehicleName: doc.vehicle?.name ?? 'Unknown',
    startDate: doc.startDate,
    expiryDate: doc.expiryDate,
    daysRemaining,
    link: doc.link ?? null,
    notes: doc.notes ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    vehicleId: doc.vehicleId,
    documentTypeId: doc.documentTypeId,
  };
}
