import { VehicleCategoryResponse, VehicleTypeResponse } from 'src/common/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { formatReadableDate } from 'src/common/utils/date-utils';

export const EXPORT_WHITELIST = [
  'vehicle_categories',
  'vehicle_types',
  'owners',
  'drivers',
  'locations',
  'document_types',
  'vehicles',
  'vehicle_documents',
] as const;

export type ExportType = (typeof EXPORT_WHITELIST)[number];

export interface ExportField<TRow = unknown, TValue = unknown> {
  key: string;
  title: string;
  relation?: string;
  transform?: (value: TValue, row: TRow) => unknown;
}

export interface ExportConfig<TRow = unknown> {
  filename: string;
  sheetName: string;
  model: keyof PrismaService;
  include?: Record<string, boolean>;
  fields: ExportField<TRow>[];
}

export type ExportConfigs = {
  [K in ExportType]: ExportConfig;
};

// ---------------- EXPORT CONFIGS ----------------
export const EXPORT_CONFIGS: ExportConfigs = {
  vehicle_categories: {
    filename: 'vehicle_categories_export',
    sheetName: 'Vehicle Categories',
    model: 'vehicleCategory',
    include: { types: true },
    fields: [
      { key: 'name', title: 'Category Name' },
      {
        key: 'types',
        title: 'Vehicle Types',
        transform: (_value, row: VehicleCategoryResponse) =>
          row.types?.map((t: VehicleTypeResponse) => t.name).join(', '),
      },
      {
        key: 'createdAt',
        title: 'Created At',
        transform: (v: Date) => formatReadableDate(v),
      },
    ],
  },

  vehicle_types: {
    filename: 'vehicle_types_export',
    sheetName: 'Vehicle Types',
    model: 'vehicleType',
    include: { category: true },
    fields: [
      { key: 'name', title: 'Type Name' },
      { key: 'category.name', title: 'Category' },
      {
        key: 'createdAt',
        title: 'Created At',
        transform: (v: Date) => formatReadableDate(v),
      },
    ],
  },

  owners: {
    filename: 'owners_export',
    sheetName: 'Owners',
    model: 'owner',
    fields: [
      { key: 'name', title: 'Owner Name' },
      {
        key: 'createdAt',
        title: 'Created At',
        transform: (v: Date) => formatReadableDate(v),
      },
    ],
  },

  drivers: {
    filename: 'drivers_export',
    sheetName: 'Drivers',
    model: 'driver',
    fields: [
      { key: 'name', title: 'Driver Name' },
      { key: 'phone', title: 'Phone' },
      { key: 'email', title: 'Email' },
      {
        key: 'createdAt',
        title: 'Created At',
        transform: (v: Date) => formatReadableDate(v),
      },
    ],
  },

  locations: {
    filename: 'locations_export',
    sheetName: 'Locations',
    model: 'location',
    fields: [
      { key: 'name', title: 'Location Name' },
      {
        key: 'createdAt',
        title: 'Created At',
        transform: (v: Date) => formatReadableDate(v),
      },
    ],
  },

  document_types: {
    filename: 'document_types_export',
    sheetName: 'Document Types',
    model: 'documentType',
    fields: [
      { key: 'name', title: 'Document Type' },
      {
        key: 'createdAt',
        title: 'Created At',
        transform: (v: Date) => formatReadableDate(v),
      },
    ],
  },

  vehicles: {
    filename: 'vehicles_export',
    sheetName: 'Vehicles',
    model: 'vehicle',
    include: {
      category: true,
      type: true,
      owner: true,
      driver: true,
      location: true,
    },
    fields: [
      { key: 'name', title: 'Vehicle Name' },
      { key: 'licensePlate', title: 'License Plate' },
      { key: 'rcNumber', title: 'RC Number' },
      { key: 'chassisNumber', title: 'Chassis Number' },
      { key: 'engineNumber', title: 'Engine Number' },
      { key: 'category.name', title: 'Category' },
      { key: 'type.name', title: 'Type' },
      { key: 'owner.name', title: 'Owner' },
      { key: 'driver.name', title: 'Driver' },
      { key: 'location.name', title: 'Location' },
      {
        key: 'createdAt',
        title: 'Created At',
        transform: (v: Date) => formatReadableDate(v),
      },
    ],
  },

  vehicle_documents: {
    filename: 'vehicle_documents_export',
    sheetName: 'Vehicle Documents',
    model: 'vehicleDocument',
    include: { vehicle: true, documentType: true },
    fields: [
      { key: 'vehicle.name', title: 'Vehicle' },
      { key: 'documentType.name', title: 'Document Type' },
      { key: 'documentNo', title: 'Document Number' },
      {
        key: 'startDate',
        title: 'Start Date',
        transform: (v: Date) => formatReadableDate(v),
      },
      {
        key: 'expiryDate',
        title: 'Expiry Date',
        transform: (v: Date) => formatReadableDate(v),
      },
      { key: 'link', title: 'Document Link' },
      { key: 'notes', title: 'Notes' },
      {
        key: 'createdAt',
        title: 'Created At',
        transform: (v: Date) => formatReadableDate(v),
      },
    ],
  },
} as const;
