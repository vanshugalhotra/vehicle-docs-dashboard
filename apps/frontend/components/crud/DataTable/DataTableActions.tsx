"use client";
import React from "react";
import { AppButton } from "../../ui/AppButton";
import { Edit, Trash2, Eye } from "lucide-react";

interface DataTableActionsProps<T> {
  item: T;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function DataTableActions<T>({
  item,
  onView,
  onEdit,
  onDelete,
}: DataTableActionsProps<T>) {
  if (!onView && !onEdit && !onDelete) return null;
  const size = 18;

  return (
    <div className="flex justify-center gap-1 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
      {onView && (
        <AppButton
          variant="ghost"
          size="md"
          onClick={() => onView(item)}
          className="p-1.5! hover:bg-accent/15 hover:scale-110 transition-all duration-200"
        >
          <Eye size={size} className="text-accent" />
          <span className="sr-only">View</span>
        </AppButton>
      )}
      {onEdit && (
        <AppButton
          variant="ghost"
          size="md"
          onClick={() => onEdit(item)}
          className="p-1.5! hover:bg-primary/15 hover:scale-110 transition-all duration-200"
        >
          <Edit size={size} className="text-primary" />
          <span className="sr-only">Edit</span>
        </AppButton>
      )}
      {onDelete && (
        <AppButton
          variant="ghost"
          size="md"
          onClick={() => onDelete(item)}
          className="p-1.5! hover:bg-danger/15 hover:scale-110 transition-all duration-200"
        >
          <Trash2 size={size} className="text-danger" />
          <span className="sr-only">Delete</span>
        </AppButton>
      )}
    </div>
  );
}
