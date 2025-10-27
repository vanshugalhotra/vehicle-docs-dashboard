import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { formatReadableDate } from "@/lib/utils/dateUtils";
import { apiRoutes } from "@/lib/apiRoutes";

export const vehicleTypeSchema = z.object({
  name: z.string().min(1, "Type name is required"),
  categoryId: z.string().min(1, "Category is required"),
});

export type VehicleType = z.infer<typeof vehicleTypeSchema> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  categoryId?: string;
  categoryName?: string;
};

export const vehicleTypeFields = [
  {
    key: "name",
    label: "Type Name",
    type: "text" as const,
    placeholder: "Enter vehicle type (e.g., Mini Truck, Sedan)",
    required: true,
  },
  {
    key: "categoryId",
    label: "Category",
    type: "asyncSelect" as const,
    placeholder: "Select a category",
    required: true,
    endpoint: apiRoutes.vehicle_categories.base,
    labelField: "name",
    valueField: "id",
    inlineConfig: {
      title: "Add Category",
      endpoint: apiRoutes.vehicle_categories.base,
      createEndpoint: apiRoutes.vehicle_categories.base,
      fields: [
        {
          key: "name",
          label: "Category Name",
          type: "text" as const,
          required: true,
        },
      ],
      schema: z.object({
        name: z.string().min(1, "Category name is required"),
      }),
    },
  },
];

export const vehicleTypeColumns: ColumnDef<VehicleType>[] = [
  {
    id: "serial",
    header: "#",
    cell: ({ row }) => row.index + 1,
    size: 40,
    minSize: 40,
    maxSize: 60,
  },
  { accessorKey: "name", header: "Type Name" },
  {
    accessorKey: "categoryName",
    header: "Category",
    cell: ({ row }) => row.original.categoryName ?? "-",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ getValue }) => formatReadableDate(getValue() as string | Date),
  },
];

export const vehicleTypeCrudConfig = {
  name: "Vehicle Type",
  baseUrl: apiRoutes.vehicle_types.base,
  fetchUrl: apiRoutes.vehicle_types.base,
  queryKey: "vehicle-types",
  schema: vehicleTypeSchema,
  fields: vehicleTypeFields,
  columns: vehicleTypeColumns,
  defaultPageSize: 5,
};
