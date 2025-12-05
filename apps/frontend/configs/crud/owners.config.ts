import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { formatReadableDate } from "@/lib/utils/dateUtils";
import { apiRoutes } from "@/lib/apiRoutes";
import { ExportType } from "@/lib/types/export.types";

export const ownerSchema = z.object({
  name: z.string().min(1, "Owner name is required"),
});

export type Owner = z.infer<typeof ownerSchema> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const ownerFields = [
  {
    key: "name",
    label: "Owner Name",
    type: "text" as const,
    placeholder: "Enter owner name",
    required: true,
  },
];

export const ownerLayout = {
  gridColumns: 1,
};

export const getColumns = (
  page: number,
  pageSize: number
): ColumnDef<Owner>[] => [
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

export const ownerCrudConfig = {
  name: "Owner",
  baseUrl: apiRoutes.owners.base,
  fetchUrl: apiRoutes.owners.base,
  queryKey: "owners",
  schema: ownerSchema,
  fields: ownerFields,
  columns: getColumns,
  layout: ownerLayout,
  defaultPageSize: 5,
  exportTable: "owners" as ExportType,
};
