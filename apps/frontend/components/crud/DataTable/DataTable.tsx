"use client";

import React from "react";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import clsx from "clsx";
import { componentTokens } from "@/styles/design-system";
import { AppButton } from "../../ui/AppButton";
import { Edit, Trash2 } from "lucide-react";
import { AppText } from "../../ui/AppText";

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  className?: string;
}

export const DataTable = <T extends object>({
  columns,
  data,
  loading = false,
  onEdit,
  onDelete,
  className,
}: DataTableProps<T>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={clsx(componentTokens.table.content, className)}>
      <table className={componentTokens.card.base}>
        <thead className="bg-surface-subtle">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={clsx(
                    "text-left px-4 py-3",
                    componentTokens.text.secondary,
                    "border-b border-border"
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-left">
                  <AppText size="label" variant="secondary">
                    Actions
                  </AppText>
                </th>
              )}
            </tr>
          ))}
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                className="text-center py-8"
              >
                <AppText size="body" variant="secondary">
                  Loading...
                </AppText>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                className="text-center py-8"
              >
                <AppText size="body" variant="secondary">
                  No data found
                </AppText>
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="transition-all duration-150">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 border-b border-border-subtle"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}

                {(onEdit || onDelete) && (
                  <td className="px-4 py-3 border-b border-border-subtle">
                    <div className="flex gap-1">
                      {onEdit && (
                        <AppButton
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(row.original)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit size={16} />
                        </AppButton>
                      )}
                      {onDelete && (
                        <AppButton
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(row.original)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 size={16} />
                        </AppButton>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
