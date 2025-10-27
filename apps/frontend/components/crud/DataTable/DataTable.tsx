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
import { AppText } from "../../ui/AppText";
import { DataTableActions } from "./DataTableActions";
import { DataTableEmptyState } from "./DataTableEmptyState";

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
    <div className={clsx("relative", className, componentTokens.table.content)}>
      <div className="border border-border-subtle rounded-lg bg-surface overflow-hidden thin-scrollbar">
        <div className="overflow-x-auto thin-scrollbar">
          <table className="w-full min-w-full">
            <thead className="bg-linear-to-r from-surface-muted to-surface-muted/80 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-border-subtle"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={clsx(
                        "text-left px-3 py-2.5",
                        "font-semibold text-text-secondary",
                        "border-r border-border-subtle/50 last:border-r-0",
                        "transition-colors duration-200",
                        "group-hover:from-primary/5 group-hover:to-primary/10"
                      )}
                      style={{
                        width: header.getSize(),
                        minWidth: header.getSize(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                  {(onEdit || onDelete) && (
                    <th
                      className="px-3 py-2.5 text-center border-r border-border-subtle/50 last:border-r-0"
                      style={{ width: 120, minWidth: 120 }}
                    >
                      <AppText
                        size="label"
                        variant="secondary"
                        className="font-semibold"
                      >
                        Actions
                      </AppText>
                    </th>
                  )}
                </tr>
              ))}
            </thead>

            <tbody className="bg-surface divide-y divide-border-subtle/30">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                    className="text-center py-10"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-7 w-7 border-2 border-primary border-t-transparent"></div>
                      <AppText size="label" variant="muted">
                        Loading your data...
                      </AppText>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                    className="text-center"
                  >
                    <DataTableEmptyState />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={clsx(
                      "transition-all duration-300 ease-out",
                      "group relative",
                      "hover:bg-linear-to-r hover:from-primary/5 hover:via-primary/3 hover:to-transparent",
                      "hover:shadow-[inset_2px_0_0_0_#0ea5e9]",
                      "hover:translate-x-0.5"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={clsx(
                          "px-3 py-2",
                          "border-r border-border-subtle/30 last:border-r-0",
                          "transition-all duration-200",
                          componentTokens.text.primary,
                          "group-hover:text-text-primary"
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}

                    {(onEdit || onDelete) && (
                      <td className="px-3 py-2 border-r border-border-subtle/30 last:border-r-0">
                        <DataTableActions
                          item={row.original}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onView={() => {}}
                        />
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
