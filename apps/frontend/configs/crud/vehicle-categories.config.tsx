import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { formatReadableDate } from "@/lib/utils/dateUtils";
import { apiRoutes } from "@/lib/apiRoutes";
import { AppBadge } from "@/components/ui/AppBadge";

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
    accessorKey: "types",
    header: "Types",
    cell: ({ row }) => {
      const types = row.original.types || [];
      const preview = types.slice(0, 3);

      if (!types.length) {
        return <span className="text-xs text-gray-400">—</span>;
      }

      return (
        <div className="flex flex-wrap items-center gap-1">
          {preview.map((t) => (
            <AppBadge
              key={t.id}
              variant="success"
              className="text-[11px] px-2 py-0.5 rounded-full"
            >
              {t.name}
            </AppBadge>
          ))}
          {types.length > 3 && (
            <span className="text-xs text-gray-400">
              +{types.length - 3} more
            </span>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ getValue }) => formatReadableDate(getValue() as string | Date),
  },
];

export const vehicleCategoryCrudConfig = {
  name: "Vehicle Category",
  baseUrl: `${apiRoutes.vehicle_categories.base}`,
  fetchUrl: `${apiRoutes.vehicle_categories.base}?includeRelations=true`,
  queryKey: "vehicle-categories",
  schema: vehicleCategorySchema,
  fields: vehicleCategoryFields,
  columns: vehicleCategoryColumns,
  defaultPageSize: 5,
};
