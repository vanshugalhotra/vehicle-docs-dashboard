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
  startDate: z.string().min(1, "Start date is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  notes: z.string().optional().nullable(),
  link: z.string().optional().nullable(),
});

export type LinkageEntity = VehicleDocumentResponse;

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
  {
    accessorKey: "documentTypeName",
    header: "Document Type",
  },
  {
    accessorKey: "documentNo",
    header: "Document No",
  },
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
      if (daysRemaining <= 0)
        return <AppBadge variant="danger">Expired</AppBadge>;
      if (daysRemaining <= 30)
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
  {
    accessorKey: "notes",
    header: "Notes",
  },
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
  columns: linkageColumns,
  defaultPageSize: 3,
};
