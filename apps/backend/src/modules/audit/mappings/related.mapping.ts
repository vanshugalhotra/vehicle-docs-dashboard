import { AuditEntity } from 'src/common/types/audit.types';
export interface RelatedField {
  idField: string; // the key in the record that stores the id
  nameField?: string; // optional human-readable field from nested object
  label?: string; // key in `related` output
}

export const RELATED_FIELDS: Record<AuditEntity, RelatedField[]> = {
  VEHICLE_DOCUMENT: [
    { idField: 'vehicleId', nameField: 'vehicle.name', label: 'vehicleName' },
    {
      idField: 'documentTypeId',
      nameField: 'documentType.name',
      label: 'documentTypeName',
    },
  ],
  VEHICLE: [],
  USER: [],
  OWNER: [],
  DRIVER: [],
  LOCATION: [],
  DOCUMENT_TYPE: [],
  REMINDER: [],
};
