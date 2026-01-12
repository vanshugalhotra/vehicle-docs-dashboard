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

  event: string; // for context.event
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
      event: 'renewed',
    },
    {
      fields: ['expiryDate'],
      condition: (before, after) =>
        new Date(after.expiryDate) < new Date(before.expiryDate),
      message: 'was preponed',
      priority: 2,
      event: 'expiry_preponed',
    },
    {
      fields: ['documentNo'],
      message: 'document number updated',
      priority: 3,
      event: 'number_changed',
    },
    {
      fields: ['amount'],
      message: 'amount updated',
      priority: 4,
      event: 'amount_changed',
    },
    {
      fields: ['startDate'],
      message: 'start date updated',
      priority: 5,
      event: 'start_date_changed',
    },
    {
      fields: ['notes'],
      message: 'notes updated',
      priority: 6,
      event: 'notes_changed',
    },
  ],

  VEHICLE: [
    {
      fields: ['driverId'],
      message: 'driver assigned',
      priority: 1,
      event: 'driver_assigned',
    },
    {
      fields: ['ownerId'],
      message: 'owner assigned',
      priority: 2,
      event: 'owner_assigned',
    },
    {
      fields: ['locationId'],
      message: 'location updated',
      priority: 3,
      event: 'location_changed',
    },
    {
      fields: ['licensePlate', 'rcNumber', 'chassisNumber', 'engineNumber'],
      message: 'identifiers updated',
      priority: 4,
      event: 'identifiers_changed',
    },
  ],

  DRIVER: [
    {
      fields: ['name'],
      message: 'name updated',
      priority: 1,
      event: 'name_changed',
    },
    {
      fields: ['phone'],
      message: 'phone number updated',
      priority: 2,
      event: 'phone_changed',
    },
    {
      fields: ['email'],
      message: 'email updated',
      priority: 3,
      event: 'email_changed',
    },
  ],

  OWNER: [
    {
      fields: ['name'],
      message: 'name updated',
      priority: 1,
      event: 'name_changed',
    },
  ],

  LOCATION: [
    {
      fields: ['name'],
      message: 'name updated',
      priority: 1,
      event: 'name_changed',
    },
  ],

  DOCUMENT_TYPE: [
    {
      fields: ['name'],
      message: 'name updated',
      priority: 1,
      event: 'name_changed',
    },
  ],

  USER: [
    {
      fields: ['email'],
      message: 'email updated',
      priority: 1,
      event: 'email_changed',
    },
    {
      fields: ['passwordHash'],
      message: 'password updated',
      priority: 2,
      event: 'password_changed',
    },
  ],
};
