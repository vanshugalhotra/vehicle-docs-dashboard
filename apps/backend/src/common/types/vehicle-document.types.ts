import { VehicleResponse } from './vehicle.types';
import { DocumentTypeResponse } from './document-type.types';

export interface VehicleDocumentResponse {
  id: string;
  vehicleId: string;
  documentTypeId: string;
  documentNo: string;
  startDate: string | Date;
  expiryDate: string | Date;
  notes?: string | null;
  link?: string | null;
  createdById?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Relations (optional - included when relations are fetched)
  vehicle?: VehicleResponse;
  documentType?: DocumentTypeResponse;
}

export const DOCUMENT_ALLOWED_BUSINESS_FILTERS = {
  status: ['expired', 'active', 'expiringSoon'],
} as const;
