import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { formatReadableDate } from "@/lib/utils/dateUtils";
import { apiRoutes } from "@/lib/apiRoutes";
import { SortOption } from "@/lib/types/filter.types";
import { FilterConfig } from "@/lib/types/filter.types";
import { ExportType } from "@/lib/types/export.types";
import { EntityDetailConfig } from "@/lib/types/entity-details.types";
import { Clock, File } from "lucide-react";

// -------------------------------
// Schema
// -------------------------------
export const documentTypeSchema = z.object({
  name: z.string().min(1, "Document type name is required"),
});

export type DocumentType = z.infer<typeof documentTypeSchema> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

// -------------------------------
// Fields
// -------------------------------
export const documentTypeFields = [
  {
    key: "name",
    label: "Document Type Name",
    type: "text" as const,
    placeholder: "Enter document type name",
    required: true,
  },
];

// -------------------------------
// Form layout
// -------------------------------
export const documentTypeLayout = {
  gridColumns: 1,
};

// -------------------------------
// Table columns
// -------------------------------
export const getColumns = (
  page: number,
  pageSize: number
): ColumnDef<DocumentType>[] => [
  {
    id: "serial",
    header: "#",
    cell: ({ row }) => row.index + 1 + (page - 1) * pageSize,
    size: 40,
  },
  { accessorKey: "name", header: "Name", enableSorting: true },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ getValue }) => formatReadableDate(getValue() as string | Date),
    enableSorting: true,
  },
];

// -------------------------------
// Filters
// -------------------------------
export const documentTypeFilters: FilterConfig[] = [];

// -------------------------------
// Sort options
// -------------------------------
export const documentTypeSortOptions: SortOption[] = [
  { field: "createdAt", label: "Created Date" },
  { field: "updatedAt", label: "Modified Date", default: true },
  { field: "name", label: "Name" },
];

// -------------------------------
// CRUD Config
// -------------------------------
export const documentTypeCrudConfig = {
  name: "Document Type",
  baseUrl: apiRoutes.document_types.base,
  fetchUrl: apiRoutes.document_types.base,
  queryKey: "document-types",
  schema: documentTypeSchema,
  fields: documentTypeFields,
  columns: getColumns,
  layout: documentTypeLayout,
  filters: documentTypeFilters,
  sortOptions: documentTypeSortOptions,
  defaultPageSize: 5,
  exportTable: "document_types" as ExportType,
};

export const documentTypeDetailConfig: EntityDetailConfig<DocumentType> = {
  columns: 2,
  sections: [
    {
      title: "Document Type Information",
      fields: [
        {
          key: "name",
          label: "Name",
          icon: <File className="h-4 w-4" />,
          copyable: true,
        },
      ],
    },
    {
      title: "Meta",
      fields: [
        {
          key: "createdAt",
          label: "Created At",
          icon: <Clock className="h-4 w-4" />,
          render: (v) => formatReadableDate(v as string),
        },
        {
          key: "updatedAt",
          label: "Last Updated",
          icon: <Clock className="h-4 w-4" />,
          render: (v) => formatReadableDate(v as string),
        },
      ],
    },
  ],
};
