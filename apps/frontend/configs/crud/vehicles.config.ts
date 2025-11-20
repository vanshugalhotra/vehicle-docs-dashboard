import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { apiRoutes } from "@/lib/apiRoutes";
import { formatReadableDate } from "@/lib/utils/dateUtils";
import { driverFields, driverSchema } from "./drivers.config";
import {
  vehicleCategoryFields,
  vehicleCategorySchema,
} from "./vehicle-categories.config";
import { vehicleTypeFields, vehicleTypeSchema } from "./vehicle-types.config";
import { ownerFields, ownerSchema } from "./owners.config";
import { locationFields, locationSchema } from "./locations.config";
import { FilterConfig, SortOption } from "@/lib/types/filter.types";
import { Option } from "@/components/ui/AppSelect";

// =====================
// 🔹 Schema
// =====================
const optionalString = () =>
  z
    .union([z.string(), z.literal(""), z.null()])
    .optional()
    .transform((val) => (val === "" || val === null ? undefined : val));

export const vehicleSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  typeId: z.string().min(1, "Vehicle type is required"),
  licensePlate: z.string().min(1, "License plate is required"),
  rcNumber: z.string().min(1, "RC number is required"),
  chassisNumber: z.string().min(1, "Chassis number is required"),
  engineNumber: z.string().min(1, "Engine number is required"),
  ownerId: optionalString(),
  locationId: optionalString(),
  driverId: optionalString(),
  notes: optionalString(),
});
export type Vehicle = z.infer<typeof vehicleSchema> & {
  id?: string;
  name?: string;
  categoryName?: string;
  typeName?: string;
  ownerName?: string;
  driverName?: string;
  locationName?: string;
  createdAt?: string;
  updatedAt?: string;
};

// =====================
// 🔹 Fields (inline dropdowns configured)
// =====================
export const vehicleFields = [
  {
    key: "categoryId",
    label: "Category",
    type: "asyncSelect" as const,
    placeholder: "Select category",
    required: true,
    endpoint: apiRoutes.vehicle_categories.base,
    labelField: "name",
    valueField: "id",
    inlineConfig: {
      title: "Add Category",
      endpoint: apiRoutes.vehicle_categories.base,
      createEndpoint: apiRoutes.vehicle_categories.base,
      fields: vehicleCategoryFields,
      schema: vehicleCategorySchema,
    },
  },
  {
    key: "typeId",
    label: "Type",
    type: "asyncSelect" as const,
    placeholder: "Select vehicle type",
    required: true,
    endpoint: apiRoutes.vehicle_types.base,
    labelField: "name",
    valueField: "id",
    dependsOn: "categoryId",
    filterKey: "categoryId",
    inlineConfig: {
      title: "Add Vehicle Type",
      endpoint: apiRoutes.vehicle_types.base,
      createEndpoint: apiRoutes.vehicle_types.base,
      fields: vehicleTypeFields,
      schema: vehicleTypeSchema,
    },
  },
  {
    key: "licensePlate",
    label: "License Plate",
    type: "text" as const,
    placeholder: "Unique license plate",
    required: true,
  },
  {
    key: "rcNumber",
    label: "RC Number",
    type: "text" as const,
    placeholder: "Enter RC number",
    required: true,
  },
  {
    key: "chassisNumber",
    label: "Chassis Number",
    type: "text" as const,
    placeholder: "Enter chassis number",
    required: true,
  },
  {
    key: "engineNumber",
    label: "Engine Number",
    type: "text" as const,
    placeholder: "Enter engine number",
    required: true,
  },
  {
    key: "ownerId",
    label: "Owner",
    type: "asyncSelect" as const,
    placeholder: "Select or add owner",
    required: false,
    endpoint: apiRoutes.owners.base,
    labelField: "name",
    valueField: "id",
    inlineConfig: {
      title: "Add Owner",
      endpoint: apiRoutes.owners.base,
      createEndpoint: apiRoutes.owners.base,
      fields: ownerFields,
      schema: ownerSchema,
    },
  },
  {
    key: "driverId",
    label: "Driver",
    type: "asyncSelect" as const,
    placeholder: "Select or add driver",
    required: false,
    endpoint: apiRoutes.drivers.base,
    labelField: "name",
    valueField: "id",
    inlineConfig: {
      title: "Add Driver",
      endpoint: apiRoutes.drivers.base,
      createEndpoint: apiRoutes.drivers.base,
      fields: driverFields,
      schema: driverSchema,
    },
  },
  {
    key: "locationId",
    label: "Location",
    type: "asyncSelect" as const,
    placeholder: "Select or add location",
    required: false,
    endpoint: apiRoutes.locations.base,
    labelField: "name",
    valueField: "id",
    inlineConfig: {
      title: "Add Location",
      endpoint: apiRoutes.locations.base,
      createEndpoint: apiRoutes.locations.base,
      fields: locationFields,
      schema: locationSchema,
    },
  },
  {
    key: "notes",
    label: "Notes",
    type: "textarea" as const,
    placeholder: "Additional notes (optional)",
    required: false,
  },
];

export const vehicleLayout = {
  gridColumns: 3,
  fieldSpans: {
    notes: 3,
  },
};

// =====================
// 🔹 Table Columns
// =====================
export const vehicleColumns: ColumnDef<Vehicle>[] = [
  {
    id: "serial",
    header: "#",
    cell: ({ row }) => row.index + 1,
    size: 40,
  },
  { accessorKey: "name", header: "Vehicle Name", enableSorting: true },
  { accessorKey: "licensePlate", header: "License Plate" },
  { accessorKey: "typeName", header: "Type" },
  { accessorKey: "categoryName", header: "Category" },
  { accessorKey: "driverName", header: "Driver" },
  { accessorKey: "ownerName", header: "Owner" },
  { accessorKey: "locationName", header: "Location" },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ getValue }) => formatReadableDate(getValue() as string | Date),
    enableSorting: true,
  },
];

// =====================
// 🔹 Filter Config
// =====================

export const vehicleFiltersConfig: FilterConfig[] = [
  {
    key: "categoryId",
    label: "Category",
    type: "async-select",
    asyncSource: apiRoutes.vehicle_categories.base,
    transform: (data: unknown[]): Option[] =>
      (data as Array<{ id: string | number; name: string }>).map((item) => ({
        label: item.name,
        value: String(item.id),
      })),
  },
  {
    key: "typeId",
    label: "Type",
    type: "async-select",
    asyncSource: apiRoutes.vehicle_types.base,
    transform: (data: unknown[]): Option[] =>
      (data as Array<{ id: string | number; name: string }>).map((item) => ({
        label: item.name,
        value: String(item.id),
      })),
  },
  {
    key: "driverId",
    label: "Driver",
    type: "async-select",
    asyncSource: apiRoutes.drivers.base,
    transform: (data: unknown[]): Option[] =>
      (data as Array<{ id: string | number; name: string }>).map((item) => ({
        label: item.name,
        value: String(item.id),
      })),
  },
  {
    key: "locationId",
    label: "Location",
    type: "async-select",
    asyncSource: apiRoutes.locations.base,
    transform: (data: unknown[]): Option[] =>
      (data as Array<{ id: string | number; name: string }>).map((item) => ({
        label: item.name,
        value: String(item.id),
      })),
  },
];
// =====================
// 🔹 Sort Options
// =====================
export const vehicleSortOptions: SortOption[] = [
  { field: "createdAt", label: "Created Date" },
  { field: "updatedAt", label: "Modified Date", default: true },
];

export const vehicleBusinessFiltersConfig: FilterConfig[] = [
  {
    key: "unassigned",
    label: "Assignment Status",
    type: "select",
    options: [
      { label: "All", value: "" },
      { label: "Assigned", value: false },
      { label: "Unassigned", value: true },
    ],
  },
];

// =====================
// 🔹 CRUD Config
// =====================
export const vehicleCrudConfig = {
  name: "Vehicle",
  baseUrl: apiRoutes.vehicles.base,
  fetchUrl: apiRoutes.vehicles.base,
  queryKey: "vehicles",
  schema: vehicleSchema,
  fields: vehicleFields,
  columns: vehicleColumns,
  defaultPageSize: 10,
  layout: vehicleLayout,
  filters: vehicleFiltersConfig,
  sortOptions: vehicleSortOptions,
  businessFilters: vehicleBusinessFiltersConfig,
};
