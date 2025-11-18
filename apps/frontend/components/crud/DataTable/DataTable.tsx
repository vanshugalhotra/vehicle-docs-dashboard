"use client";
import React from "react";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import clsx from "clsx";
import { componentTokens } from "@/styles/design-system/componentTokens";
import { AppText } from "../../ui/AppText";
import { DataTableActions } from "./DataTableActions";
import { DataTableEmptyState } from "./DataTableEmptyState";
import { ColumnSorter } from "./ColumnSorter";

export interface SortState {
  field?: string;
  order?: "asc" | "desc";
}
export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  className?: string;
  sort?: SortState;
  setSort?: (sort: SortState) => void;
}

export const DataTable = <T extends object>({
  columns,
  data,
  loading = false,
  onEdit,
  onDelete,
  onView,
  className,
  sort,
  setSort,
}: DataTableProps<T>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div
      className={clsx("relative z-0", className, componentTokens.table.content)}
    >
      <div
        className={clsx(
          "border border-border-subtle/50 rounded-xl bg-surface overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300",
          componentTokens.card.base
        )}
      >
        <div className="overflow-x-auto thin-scrollbar">
          <table className="w-full min-w-full">
            <thead className="bg-disabled sticky top-0 z-10 backdrop-blur-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-border-subtle/50"
                >
                  {headerGroup.headers.map((header) => {
                    const colDef = header.column.columnDef as ColumnDef<T, unknown>;
                    const isSortable = colDef.enableSorting;
                    const field = header.column.id;

                    return (
                      <th
                        key={header.id}
                        className={clsx(
                          "text-left px-6 py-4",
                          "font-medium text-text-secondary tracking-wide",
                          "border-r border-border-subtle/30 last:border-r-0",
                          "transition-all duration-200 hover:bg-primary/5"
                        )}
                        style={{
                          width: header.getSize(),
                          minWidth: header.getSize(),
                        }}
                      >
                        {isSortable && field && setSort ? (
                          <ColumnSorter
                            field={field as string}
                            label={
                              typeof colDef.header === "string"
                                ? colDef.header
                                : String(flexRender(colDef.header, header.getContext()))
                            }
                            currentSort={
                              sort?.field && sort?.order
                                ? { field: sort.field, order: sort.order }
                                : null
                            }
                            onChange={(f, o) => setSort({ field: f, order: o })}
                          />
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </th>
                    );
                  })}
                  {(onEdit || onDelete) && (
                    <th
                      className="px-6 py-4 text-center border-r border-border-subtle/30 last:border-r-0"
                      style={{ width: 120, minWidth: 120 }}
                    >
                      <AppText
                        size="label"
                        variant="secondary"
                        className={clsx(
                          componentTokens.text.sizes.label,
                          "font-medium tracking-wide"
                        )}
                      >
                        Actions
                      </AppText>
                    </th>
                  )}
                </tr>
              ))}
            </thead>

            <tbody className="bg-surface divide-y divide-border-subtle/20">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                    className="text-center py-12"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary"></div>
                        <div className="absolute inset-0 rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary animate-ping"></div>
                      </div>
                      <AppText
                        size="body"
                        variant="muted"
                        className={clsx(
                          componentTokens.text.muted,
                          "font-medium"
                        )}
                      >
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
                    <DataTableEmptyState />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={clsx(
                      "transition-all duration-300 ease-out",
                      "group relative border-l-4 border-transparent",
                      index % 2 === 0 ? "bg-surface/50" : "",
                      "hover:bg-linear-to-r hover:from-primary/5 hover:to-primary/2",
                      "hover:border-l-primary/20 hover:shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.05)]",
                      "hover:translate-y-px"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={clsx(
                          "px-6 py-4",
                          "border-r border-border-subtle/20 last:border-r-0",
                          "transition-colors duration-200",
                          componentTokens.text.bodySecondary,
                          "group-hover:text-text-primary/90"
                        )}
                      >
                        <div className="truncate">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      </td>
                    ))}

                    {(onEdit || onDelete) && (
                      <td className="px-6 py-4 border-r border-border-subtle/20 last:border-r-0">
                        <DataTableActions
                          item={row.original}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onView={onView}
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