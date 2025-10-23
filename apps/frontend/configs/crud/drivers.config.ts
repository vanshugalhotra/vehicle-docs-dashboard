import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { formatReadableDate } from "@/lib/utils/dateUtils";
import { apiRoutes } from "@/lib/apiRoutes";

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

export const driverColumns: ColumnDef<Driver>[] = [
  {
    id: "serial",
    header: "#",
    cell: ({ row }) => row.index + 1,
    size: 40,
    minSize: 40,
    maxSize: 60,
  },
  { accessorKey: "name", header: "Name" },
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
  },
];

export const driverCrudConfig = {
  name: "Driver",
  baseUrl: apiRoutes.drivers.base,
  queryKey: "drivers",
  schema: driverSchema,
  fields: driverFields,
  columns: driverColumns,
  defaultPageSize: 5,
};
