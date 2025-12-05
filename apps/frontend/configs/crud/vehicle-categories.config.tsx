import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { formatReadableDate } from "@/lib/utils/dateUtils";
import { apiRoutes } from "@/lib/apiRoutes";
import { BadgeCell } from "@/components/crud/DataTable/BadgeCell";
import { ExportType } from "@/lib/types/export.types";

export const vehicleCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export type VehicleCategory = z.infer<typeof vehicleCategorySchema> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  types?: { id: string; name: string }[];
};

export const vehicleCategoryFields = [
  {
    key: "name",
    label: "Category Name",
    type: "text" as const,
    placeholder: "Enter category name (e.g., Truck, Car, Bus)",
    required: true,
  },
];

export const getColumns = (
  page: number,
  pageSize: number
): ColumnDef<VehicleCategory>[] => [
  {
    id: "serial",
    header: "#",
    cell: ({ row }) => row.index + 1 + (page - 1) * pageSize,
    size: 40,
  },
  { accessorKey: "name", header: "Name", enableSorting: true },

  {
    accessorKey: "types",
    header: "Types",
    cell: ({ row }) => <BadgeCell items={row.original.types} />,
  },

  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ getValue }) => formatReadableDate(getValue() as string | Date),
    enableSorting: true,
  },
];

export const categoryLayout = {
  gridColumns: 1,
};

export const vehicleCategoryCrudConfig = {
  name: "Vehicle Category",
  baseUrl: `${apiRoutes.vehicle_categories.base}`,
  fetchUrl: `${apiRoutes.vehicle_categories.base}?includeRelations=true`,
  queryKey: "vehicle-categories",
  schema: vehicleCategorySchema,
  fields: vehicleCategoryFields,
  columns: getColumns,
  defaultPageSize: 5,
  layout: categoryLayout,
  exportTable: "vehicle_categories" as ExportType,
};
