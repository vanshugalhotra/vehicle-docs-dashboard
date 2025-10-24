import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { formatReadableDate } from "@/lib/utils/dateUtils";
import { apiRoutes } from "@/lib/apiRoutes";

export const locationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
});

export type Location = z.infer<typeof locationSchema> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const locationFields = [
  {
    key: "name",
    label: "Location Name",
    type: "text" as const,
    placeholder: "Enter location name (e.g., Chandigarh)",
    required: true,
  },
];

export const locationColumns: ColumnDef<Location>[] = [
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

export const locationCrudConfig = {
  name: "Location",
  baseUrl: apiRoutes.locations.base,
  fetchUrl: apiRoutes.locations.base,
  queryKey: "locations",
  schema: locationSchema,
  fields: locationFields,
  columns: locationColumns,
  defaultPageSize: 5,
};
