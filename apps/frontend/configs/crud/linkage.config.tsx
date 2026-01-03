import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { apiRoutes } from "@/lib/apiRoutes";
import { VehicleDocumentResponse } from "@/lib/types/vehicle-document.types";
import { formatReadableDate } from "@/lib/utils/dateUtils";
import { AppBadge } from "@/components/ui/AppBadge";
import { FilterConfig, SortOption } from "@/lib/types/filter.types";
import { Option } from "@/components/ui/AppSelect";
import { statusToExpiryFilter } from "@/lib/utils/statusFilterCalculation";
import { ExportType } from "@/lib/types/export.types";

// =====================
// 🔹 Schema
// =====================
export const linkageSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  documentTypeId: z.string().min(1, "Document type is required"),
  documentNo: z.string().min(1, "Document number is required"),
  startDate: z
    .union([z.string(), z.date()])
    .refine(
      (val) => val !== null && val !== undefined && val !== "",
      "Start date is required"
    ),
  expiryDate: z
    .union([z.string(), z.date()])
    .refine(
      (val) => val !== null && val !== undefined && val !== "",
      "Expiry date is required"
    ),
  notes: z.string().optional().nullable(),
  link: z.string().optional().nullable(),
  amount: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        if (!/^-?\d+(\.\d+)?$/.test(val)) return false;

        const beforeDecimal = val.split(".")[0].replace("-", "");
        return beforeDecimal.length <= 10;
      },
      { message: "Invalid Amount" }
    ),
});

export const renewalSchema = z.object({
  documentNo: z.string().min(1, "Document number is required"),
  startDate: z
    .union([z.string(), z.date()])
    .refine(
      (val) => val !== null && val !== undefined && val !== "",
      "Start date is required"
    ),
  expiryDate: z
    .union([z.string(), z.date()])
    .refine(
      (val) => val !== null && val !== undefined && val !== "",
      "Expiry date is required"
    ),
});

export type LinkageEntity = VehicleDocumentResponse;

// =====================
// 🔹 Fields
// =====================
export const linkageFields = [
  {
    key: "vehicleId",
    label: "Vehicle",
    type: "text" as const,
    placeholder: "Vehicle",
    required: true,
    disabled: true,
  },
  {
    key: "documentTypeId",
    label: "Document Type",
    type: "text" as const,
    placeholder: "Document type",
    required: true,
    disabled: true,
  },
  {
    key: "documentNo",
    label: "Document No",
    type: "text" as const,
    placeholder: "Unique document number",
    required: true,
  },
  {
    key: "startDate",
    label: "Start Date",
    type: "date" as const,
    placeholder: "Select start date",
    required: true,
  },
  {
    key: "expiryDate",
    label: "Expiry Date",
    type: "date" as const,
    placeholder: "Select expiry date",
    required: true,
  },

  {
    key: "link",
    label: "Link",
    type: "text" as const,
    placeholder: "Optional external link",
    required: false,
  },
  {
    key: "notes",
    label: "Notes",
    type: "textarea" as const,
    placeholder: "Optional notes",
    required: false,
  },
  {
    key: "amount",
    label: "Amount",
    type: "text" as const,
    placeholder: "Amount",
    required: false,
  },
];

export const linkageLayout = {
  gridColumns: 3,
  fieldSpans: {
    notes: 3,
  },
};

// =====================
// 🔹 Table Columns
// =====================
export const getColumns = (
  page: number,
  pageSize: number
): ColumnDef<LinkageEntity>[] => [
  {
    id: "serial",
    header: "#",
    cell: ({ row }) => row.index + 1 + (page - 1) * pageSize,
    size: 40,
  },
  {
    accessorKey: "vehicleName",
    header: "Vehicle",
    minSize: 250,
    maxSize: 350,
  },
  { accessorKey: "documentTypeName", header: "Document Type" },
  { accessorKey: "documentNo", header: "Document No" },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const daysRemaining = row.original.daysRemaining;
      if (typeof daysRemaining === "number" && daysRemaining <= 0)
        return <AppBadge variant="danger">Expired</AppBadge>;
      else if (typeof daysRemaining === "number" && daysRemaining <= 30)
        return <AppBadge variant="warning">Expiring Soon</AppBadge>;
      return <AppBadge variant="success">Active</AppBadge>;
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ getValue }) => formatReadableDate(getValue() as string | Date),
    enableSorting: true,
  },
  {
    accessorKey: "expiryDate",
    header: "Expiry Date",
    cell: ({ getValue }) => formatReadableDate(getValue() as string | Date),
    enableSorting: true,
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "link",
    header: "Link",
    cell: ({ getValue }) => {
      const link = getValue() as string | null;
      if (!link) return "-";
      return (
        <Link
          href={link.startsWith("http") ? link : `https://${link}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary-dark transition-colors"
        >
          Open
        </Link>
      );
    },
    minSize: 100,
    maxSize: 200,
  },

  { accessorKey: "notes", header: "Notes", minSize: 250, maxSize: 300 },
];

// =====================
// 🔹 Filters Config
// =====================

export const linkageFiltersConfig: FilterConfig[] = [
  {
    key: "vehicleId",
    label: "Vehicle",
    type: "async-select",
    asyncSource: apiRoutes.vehicles.base,
    transform: (data: unknown[]): Option[] =>
      (data as Array<{ id: string; name: string }>).map((v) => ({
        label: v.name,
        value: v.id,
      })),
  },
  {
    key: "documentTypeId",
    label: "Document Type",
    type: "async-select",
    asyncSource: apiRoutes.document_types.base,
    transform: (data: unknown[]): Option[] =>
      (data as Array<{ id: string; name: string }>).map((d) => ({
        label: d.name,
        value: d.id,
      })),
  },
  {
    key: "startDate",
    label: "Start Date",
    type: "dateRange",
  },
  {
    key: "expiryDate",
    label: "Expiry Date",
    type: "dateRange", // new date range filter
  },
  {
    key: "expiryDate",
    label: "Status",
    type: "tab",
    options: [
      { label: "All", value: "" },
      {
        label: "Expired",
        value: JSON.stringify(statusToExpiryFilter("expired")),
      },
      {
        label: "Today",
        value: JSON.stringify(statusToExpiryFilter("today")),
      },
      {
        label: "1 Day",
        value: JSON.stringify(statusToExpiryFilter("in_1_day")),
      },
      {
        label: "1 Week",
        value: JSON.stringify(statusToExpiryFilter("in_1_week")),
      },
      {
        label: "1 Month",
        value: JSON.stringify(statusToExpiryFilter("in_1_month")),
      },
      {
        label: "1 Year",
        value: JSON.stringify(statusToExpiryFilter("in_1_year")),
      },
    ],
  },
];
// =====================
// 🔹 Sort Options
// =====================
export const linkageSortOptions: SortOption[] = [
  { field: "updatedAt", label: "Modified Date", default: true },
  { field: "expiryDate", label: "Expiry Date" },
  { field: "startDate", label: "Start Date" },
  { field: "documentNo", label: "Document No" },
];

export const linkageBusinessFiltersConfig: FilterConfig[] = [];

// =====================
// 🔹 CRUD Config
// =====================
export const linkageCrudConfig = {
  name: "Vehicle Document Linkage",
  baseUrl: apiRoutes.vehicle_documents.base,
  fetchUrl: apiRoutes.vehicle_documents.list,
  queryKey: "vehicle-documents",
  schema: linkageSchema,
  fields: linkageFields,
  columns: getColumns,
  layout: linkageLayout,
  defaultPageSize: 10,
  filters: linkageFiltersConfig,
  businessFilters: linkageBusinessFiltersConfig,
  sortOptions: linkageSortOptions,
  exportTable: "vehicle_documents" as ExportType,
};
