import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { formatReadableDate } from "@/lib/utils/dateUtils";
import { apiRoutes } from "@/lib/apiRoutes";

export const documentTypeSchema = z.object({
  name: z.string().min(1, "Document type name is required"),
});

export type DocumentType = z.infer<typeof documentTypeSchema> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const documentTypeFields = [
  {
    key: "name",
    label: "Document Type Name",
    type: "text" as const,
    placeholder: "Enter document type name",
    required: true,
  },
];

export const documentTypeLayout = {
  gridColumns: 1
}

export const documentTypeColumns: ColumnDef<DocumentType>[] = [
  {
    id: "serial",
    header: "#",
    cell: ({ row }) => row.index + 1,
    size: 40,
    minSize: 40,
    maxSize: 60,
  },
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ getValue }) => formatReadableDate(getValue() as string | Date),
  },
];

export const documentTypeCrudConfig = {
  name: "Document Type",
  baseUrl: apiRoutes.document_types.base,
  fetchUrl: apiRoutes.document_types.base,
  queryKey: "document-types",
  schema: documentTypeSchema,
  fields: documentTypeFields,
  columns: documentTypeColumns,
  layout: documentTypeLayout,
  defaultPageSize: 5,
};