import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { formatReadableDate } from "@/lib/utils/dateUtils";
import { apiRoutes } from "@/lib/apiRoutes";
import { ExportType } from "@/lib/types/export.types";
import { EntityDetailConfig } from "@/lib/types/entity-details.types";
import { Clock, User } from "lucide-react";

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

export const getColumns = (
  page: number,
  pageSize: number
): ColumnDef<Location>[] => [
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

export const locationLayout = {
  gridColumns: 1,
};

export const locationCrudConfig = {
  name: "Location",
  baseUrl: apiRoutes.locations.base,
  fetchUrl: apiRoutes.locations.base,
  queryKey: "locations",
  schema: locationSchema,
  fields: locationFields,
  columns: getColumns,
  defaultPageSize: 5,
  layout: locationLayout,
  exportTable: "locations" as ExportType,
};

export const locationDetailConfig: EntityDetailConfig<Location> = {
  columns: 2,
  sections: [
    {
      title: "Location Information",
      fields: [
        {
          key: "name",
          label: "Name",
          icon: <User className="h-4 w-4" />,
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
