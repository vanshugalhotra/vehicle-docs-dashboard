"use client";

import React from "react";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import clsx from "clsx";
import { AppButton } from "../../ui/AppButton";
import { Edit, Trash2 } from "lucide-react";
import { shadow, typography } from "../../tokens/designTokens";

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
    <div className={clsx("overflow-x-auto w-full", className)}>
      <table className={clsx("w-full border-collapse", shadow.sm)}>
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={clsx(
                    "text-left px-4 py-2",
                    typography.label,
                    "border-b border-gray-200"
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
              {(onEdit || onDelete) && <th className="px-4 py-2">Actions</th>}
            </tr>
          ))}
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="text-center py-8 text-gray-400"
              >
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="text-center py-8 text-gray-400"
              >
                No data found
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-2 border-b border-gray-200"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}

                {(onEdit || onDelete) && (
                  <td className="px-4 py-2 border-b border-gray-200 flex gap-2">
                    {onEdit && (
                      <AppButton
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(row.original)}
                      >
                        <Edit size={16} />
                      </AppButton>
                    )}
                    {onDelete && (
                      <AppButton
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(row.original)}
                      >
                        <Trash2 size={16} />
                      </AppButton>
                    )}
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
