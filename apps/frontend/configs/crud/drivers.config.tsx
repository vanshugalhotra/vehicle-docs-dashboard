import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { formatReadableDate } from "@/lib/utils/dateUtils";
import { apiRoutes } from "@/lib/apiRoutes";
import { ExportType } from "@/lib/types/export.types";
import { EntityDetailConfig } from "@/lib/types/entity-details.types";
import { User, Phone, Mail, Clock } from "lucide-react";

export const driverSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z
    .union([z.string().email("Invalid email"), z.literal(""), z.null()])
    .optional()
    .transform((val) => (val === "" || val === null ? undefined : val)),
});

export type Driver = z.infer<typeof driverSchema> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const driverFields = [
  {
    key: "name",
    label: "Name",
    type: "text" as const,
    placeholder: "Enter driver name",
    required: true,
  },
  {
    key: "phone",
    label: "Phone",
    type: "text" as const,
    placeholder: "Enter phone number",
    required: true,
  },
  {
    key: "email",
    label: "Email",
    type: "text" as const,
    placeholder: "Enter email address",
  },
];

export const getColumns = (
  page: number,
  pageSize: number
): ColumnDef<Driver>[] => [
  {
    id: "serial",
    header: "#",
    cell: ({ row }) => row.index + 1 + (page - 1) * pageSize,
    size: 40,
  },
  { accessorKey: "name", header: "Name", enableSorting: true },
  { accessorKey: "phone", header: "Phone" },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ getValue }) => getValue() || "-",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ getValue }) => formatReadableDate(getValue() as string | Date),
    enableSorting: true,
  },
];

export const driverLayout = {
  gridColumns: 1,
};

export const driverCrudConfig = {
  name: "Driver",
  baseUrl: apiRoutes.drivers.base,
  fetchUrl: apiRoutes.drivers.base,
  queryKey: "drivers",
  schema: driverSchema,
  fields: driverFields,
  columns: getColumns,
  layout: driverLayout,
  defaultPageSize: 5,
  exportTable: "drivers" as ExportType,
};

export const driverDetailConfig: EntityDetailConfig<Driver> = {
  columns: 2,
  sections: [
    // =====================
    // 🔹 Basic Information
    // =====================
    {
      title: "Driver Information",
      fields: [
        {
          key: "name",
          label: "Name",
          icon: <User className="h-4 w-4" />,
          copyable: true,
        },
        {
          key: "phone",
          label: "Phone",
          icon: <Phone className="h-4 w-4" />,
          copyable: true,
        },
        {
          key: "email",
          label: "Email",
          icon: <Mail className="h-4 w-4" />,
          render: (v) => v || "—",
          copyable: true,
        },
      ],
    },

    // =====================
    // 🔹 Meta
    // =====================
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
