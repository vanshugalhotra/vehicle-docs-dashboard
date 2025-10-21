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
    <div className={clsx("relative", className, componentTokens.table.content)}>
      <div className="border border-border-subtle rounded-lg bg-surface overflow-hidden thin-scrollbar">
        <div className="overflow-x-auto thin-scrollbar">
          <table className="w-full min-w-full">
            <thead className="bg-gradient-to-r from-surface-muted to-surface-muted/80 sticky top-0 z-10">
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
                    className="text-center py-12"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-surface-muted to-surface-muted/50 rounded-full flex items-center justify-center">
                        <svg
                          className="w-7 h-7 text-text-muted"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                      </div>
                      <AppText
                        size="body"
                        variant="muted"
                        className="font-medium"
                      >
                        No records found
                      </AppText>
                      <AppText
                        size="label"
                        variant="muted"
                        className="max-w-md text-center opacity-75"
                      >
                        {columns.length > 1
                          ? "Try adjusting your search criteria or add a new record to get started."
                          : "No data available in the system."}
                      </AppText>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={clsx(
                      "transition-all duration-300 ease-out",
                      "group relative",
                      // Beautiful gradient hover effect
                      "hover:bg-gradient-to-r hover:from-primary/5 hover:via-primary/3 hover:to-transparent",
                      "hover:shadow-[inset_2px_0_0_0_#0ea5e9]",
                      "hover:translate-x-0.5"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={clsx(
                          "px-3 py-2", // More compact
                          "border-r border-border-subtle/30 last:border-r-0",
                          "transition-all duration-200",
                          componentTokens.text.primary,
                          "group-hover:text-text-primary group-hover:font-medium"
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
                        <div className="flex justify-center gap-1 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                          {onEdit && (
                            <AppButton
                              variant="ghost"
                              size="md"
                              onClick={() => onEdit(row.original)}
                              className="!p-1.5 hover:bg-primary/15 hover:scale-110 transition-all duration-200"
                            >
                              <Edit size={16} className="text-primary" />
                              <span className="sr-only">Edit</span>
                            </AppButton>
                          )}
                          {onDelete && (
                            <AppButton
                              variant="ghost"
                              size="md"
                              onClick={() => onDelete(row.original)}
                              className="!p-1.5 hover:bg-danger/15 hover:scale-110 transition-all duration-200"
                            >
                              <Trash2 size={16} className="text-danger" />
                              <span className="sr-only">Delete</span>
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
      </div>

      {/* Enhanced Footer */}
      {!loading && data.length > 0 && (
        <div className="mt-3 flex justify-between items-center px-1">
          <AppText size="label" variant="muted" className="font-medium">
            <span className="text-text-primary">{data.length}</span> record
            {data.length !== 1 ? "s" : ""} total
          </AppText>
          <div className="flex items-center gap-4">
            <AppText size="label" variant="muted">
              Page <span className="text-text-primary font-medium">1</span> of{" "}
              <span className="text-text-primary font-medium">1</span>
            </AppText>
            <div className="w-px h-4 bg-border-subtle"></div>
            <AppText size="label" variant="muted">
              <span className="text-text-primary font-medium">
                {columns.length}
              </span>{" "}
              columns
            </AppText>
          </div>
        </div>
      )}
    </div>
  );
};