import {
  VehicleDocument,
  Vehicle,
  Driver,
  Owner,
  Location,
  DocumentType,
  User,
} from '@prisma/client';

export type Path = string;

export interface PlaceholderMapping {
  path: Path;
  fallback: string; // literal text fallback
}

export interface SubjectTemplate {
  template: string; // e.g. "<vehicleName> for <documentTypeName>"
  placeholders: Record<string, PlaceholderMapping>;
}

export type SummarySubjectMapping = Record<string, SubjectTemplate>;

export const SUMMARY_SUBJECT_MAPPING: SummarySubjectMapping = {
  VEHICLE_DOCUMENT: {
    template: '<documentTypeName> for <vehicleName>',
    placeholders: {
      documentTypeName: {
        path: 'documentType.name',
        fallback: 'document',
      },
      vehicleName: {
        path: 'vehicle.name',
        fallback: 'vehicle',
      },
    },
  },

  VEHICLE: {
    template: '<vehicleName>',
    placeholders: {
      vehicleName: {
        path: 'name',
        fallback: 'vehicle',
      },
    },
  },

  DRIVER: {
    template: '<driverName>',
    placeholders: {
      driverName: {
        path: 'name',
        fallback: 'driver',
      },
    },
  },

  OWNER: {
    template: '<ownerName>',
    placeholders: {
      ownerName: {
        path: 'name',
        fallback: 'owner',
      },
    },
  },

  LOCATION: {
    template: '<locationName>',
    placeholders: {
      locationName: {
        path: 'name',
        fallback: 'location',
      },
    },
  },

  DOCUMENT_TYPE: {
    template: '<documentTypeName>',
    placeholders: {
      documentTypeName: {
        path: 'name',
        fallback: 'document type',
      },
    },
  },

  USER: {
    template: '<userEmail>',
    placeholders: {
      userEmail: {
        path: 'email',
        fallback: 'user',
      },
    },
  },
};

export interface UpdateRule<T> {
  fields: (keyof T)[]; // Fields to watch for changes
  condition?: (before: T, after: T) => boolean;
  message: string; // Text to replace "was updated"
  priority: number; // Lower number = higher priority
}

export type EntityModelMap = {
  VEHICLE_DOCUMENT: VehicleDocument;
  VEHICLE: Vehicle;
  DRIVER: Driver;
  OWNER: Owner;
  LOCATION: Location;
  DOCUMENT_TYPE: DocumentType;
  USER: User;
};

export type UpdateRulesMap = {
  [K in keyof EntityModelMap]: UpdateRule<EntityModelMap[K]>[];
};

/**
 * Update rules for generating summary messages on UPDATE actions.
 * Priority rules: higher priority messages appear first, others appended as " + other updates"
 */

export const UPDATE_RULES: UpdateRulesMap = {
  VEHICLE_DOCUMENT: [
    {
      fields: ['expiryDate'],
      condition: (before, after) =>
        new Date(after.expiryDate) > new Date(before.expiryDate),
      message: 'was renewed',
      priority: 1,
    },
    {
      fields: ['expiryDate'],
      condition: (before, after) =>
        new Date(after.expiryDate) < new Date(before.expiryDate),
      message: 'was preponed',
      priority: 2,
    },
    {
      fields: ['documentNo'],
      message: 'document number updated',
      priority: 3,
    },
    {
      fields: ['amount'],
      message: 'amount updated',
      priority: 4,
    },
    {
      fields: ['startDate'],
      message: 'start date updated',
      priority: 5,
    },
    {
      fields: ['notes'],
      message: 'notes updated',
      priority: 6,
    },
  ],

  VEHICLE: [
    {
      fields: ['driverId'],
      message: 'driver assigned',
      priority: 1,
    },
    {
      fields: ['ownerId'],
      message: 'owner assigned',
      priority: 2,
    },
    {
      fields: ['locationId'],
      message: 'location updated',
      priority: 3,
    },
    {
      fields: ['licensePlate', 'rcNumber', 'chassisNumber', 'engineNumber'],
      message: 'identifiers updated',
      priority: 4,
    },
  ],

  DRIVER: [
    { fields: ['name'], message: 'name updated', priority: 1 },
    { fields: ['phone'], message: 'phone number updated', priority: 2 },
    { fields: ['email'], message: 'email updated', priority: 3 },
  ],

  OWNER: [{ fields: ['name'], message: 'name updated', priority: 1 }],
  LOCATION: [{ fields: ['name'], message: 'name updated', priority: 1 }],
  DOCUMENT_TYPE: [{ fields: ['name'], message: 'name updated', priority: 1 }],

  USER: [
    { fields: ['email'], message: 'email updated', priority: 1 },
    { fields: ['passwordHash'], message: 'password updated', priority: 2 },
  ],
};
