export interface VehicleDocumentResponse {
  id?: string;
  vehicleId?: string;                    // Made optional
  documentTypeId?: string;               // Made optional
  documentNo?: string;                   // Made optional
  startDate?: string | Date;             // Made optional
  expiryDate?: string | Date;            // Made optional
  notes?: string | null;
  link?: string | null;
  createdById?: string | null;
  createdAt?: string | Date;             // Made optional
  updatedAt?: string | Date;             // Made optional
  daysRemaining?: number;                // Made optional
  vehicleName?: string;                  // Made optional
  documentTypeName?: string;             // Made optional
}