import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { apiRoutes } from "@/lib/apiRoutes";
import { VehicleDocumentResponse } from "@/lib/types/vehicle-document.types";
import { formatReadableDate } from "@/lib/utils/dateUtils";
import { AppBadge } from "@/components/ui/AppBadge";

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
export const linkageColumns: ColumnDef<LinkageEntity>[] = [
  {
    id: "serial",
    header: "#",
    cell: ({ row }) => row.index + 1,
    size: 40,
  },
  { accessorKey: "documentTypeName", header: "Document Type" },
  { accessorKey: "documentNo", header: "Document No" },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ getValue }) => formatReadableDate(getValue() as string | Date),
  },
  {
    accessorKey: "expiryDate",
    header: "Expiry Date",
    cell: ({ getValue }) => formatReadableDate(getValue() as string | Date),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const daysRemaining = row.original.daysRemaining;
      if (daysRemaining && daysRemaining <= 0)
        return <AppBadge variant="danger">Expired</AppBadge>;
      else if (daysRemaining && daysRemaining <= 30)
        return <AppBadge variant="warning">Expiring Soon</AppBadge>;
      return <AppBadge variant="success">Active</AppBadge>;
    },
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
  },
  { accessorKey: "notes", header: "Notes" },
];

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
  columns: linkageColumns,
  layout: linkageLayout,
  defaultPageSize: 3,
};
