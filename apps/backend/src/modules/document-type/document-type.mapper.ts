import { DocumentType } from '@prisma/client';
import { DocumentTypeResponse } from 'src/common/types';

export function mapDocumentTypeToResponse(
  documentType: DocumentType,
): DocumentTypeResponse {
  return {
    id: documentType.id,
    name: documentType.name,
    createdAt: documentType.createdAt,
    updatedAt: documentType.updatedAt,
  };
}
