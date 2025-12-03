import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { apiRoutes } from "@/lib/apiRoutes";
import { formatReadableDate } from "@/lib/utils/dateUtils";

export const reminderRecipientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  active: z.boolean().default(true),
});

export type ReminderRecipient = z.infer<typeof reminderRecipientSchema> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const reminderRecipientFields = [
  {
    key: "name",
    label: "Name",
    type: "text" as const,
    placeholder: "Enter recipient name",
    required: true,
  },
  {
    key: "email",
    label: "Email",
    type: "text" as const,
    placeholder: "Enter email address",
    required: true,
  },
  {
    key: "active",
    label: "Active",
    type: "checkbox" as const,
  },
];

export const getColumns = (
  page: number,
  pageSize: number
): ColumnDef<ReminderRecipient>[] => [
  {
    id: "serial",
    header: "#",
    cell: ({ row }) => row.index + 1 + (page - 1) * pageSize,
    size: 40,
  },
  { accessorKey: "name", header: "Name", enableSorting: true },
  { accessorKey: "email", header: "Email", enableSorting: true },
  {
    accessorKey: "active",
    header: "Active",
    cell: ({ getValue }) =>
      getValue() ? (
        <span className="text-green-600 font-medium">Yes</span>
      ) : (
        <span className="text-red-600 font-medium">No</span>
      ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ getValue }) => formatReadableDate(getValue() as string | Date),
    enableSorting: true,
  },
];

export const reminderRecipientLayout = {
  gridColumns: 1,
};

export const reminderRecipientCrudConfig = {
  name: "Reminder Recipient",
  baseUrl: apiRoutes.reminder_recipient.base,
  fetchUrl: apiRoutes.reminder_recipient.list,
  queryKey: "reminder-recipients",
  schema: reminderRecipientSchema,
  fields: reminderRecipientFields,
  columns: getColumns,
  layout: reminderRecipientLayout,
  defaultPageSize: 5,
};
