import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { apiRoutes } from "@/lib/apiRoutes";
import { VehicleDocumentResponse } from "@/lib/types/vehicle-document.types";
import { formatReadableDate } from "@/lib/utils/dateUtils";

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
  { accessorKey: "link", header: "Link" },
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
  columns: linkageColumns,
  defaultPageSize: 10,
};
