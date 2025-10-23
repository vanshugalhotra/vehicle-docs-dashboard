import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { formatReadableDate } from "@/lib/utils/dateUtils";
import { apiRoutes } from "@/lib/apiRoutes";

export const vehicleCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export type VehicleCategory = z.infer<typeof vehicleCategorySchema> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
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

export const vehicleCategoryColumns: ColumnDef<VehicleCategory>[] = [
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

export const vehicleCategoryCrudConfig = {
  name: "Vehicle Category",
  baseUrl: apiRoutes.vehicle_categories.base,
  queryKey: "vehicle-categories",
  schema: vehicleCategorySchema,
  fields: vehicleCategoryFields,
  columns: vehicleCategoryColumns,
  defaultPageSize: 5,
};
