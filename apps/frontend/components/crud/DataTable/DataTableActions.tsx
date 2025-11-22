"use client";
import React from "react";
import { AppButton } from "../../ui/AppButton";
import { Edit, Trash2, Eye, LucideIcon, ShieldAlert } from "lucide-react";

// Using standard Tailwind colors that are always available
const colorClasses = {
  accent: {
    text: "text-blue-600",
    hover: "hover:bg-blue-600/15",
  },
  primary: {
    text: "text-green-600",
    hover: "hover:bg-green-600/15",
  },
  warning: {
    text: "text-orange-600",
    hover: "hover:bg-orange-600/15",
  },
  danger: {
    text: "text-red-600",
    hover: "hover:bg-red-600/15",
  },
};

interface ActionConfig<T> {
  key: string;
  icon: LucideIcon;
  onClick: (item: T) => void;
  color: keyof typeof colorClasses;
  srText: string;
  tooltip: string;
}

interface DataTableActionsProps<T> {
  item: T;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onRenew?: (item: T) => void;
}

export function DataTableActions<T>({
  item,
  onView,
  onEdit,
  onDelete,
  onRenew,
}: DataTableActionsProps<T>) {
  const size = 18;

  // Define all possible actions in a configuration array
  const actionConfigs: (ActionConfig<T> | null)[] = [
    onView
      ? {
          key: "view",
          icon: Eye,
          onClick: onView,
          color: "accent",
          srText: "View",
          tooltip: "View",
        }
      : null,
    onEdit
      ? {
          key: "edit",
          icon: Edit,
          onClick: onEdit,
          color: "primary",
          srText: "Edit",
          tooltip: "Edit",
        }
      : null,
    onRenew
      ? {
          key: "renew",
          icon: ShieldAlert,
          onClick: onRenew,
          color: "warning",
          srText: "Renew",
          tooltip: "Renew",
        }
      : null,
    onDelete
      ? {
          key: "delete",
          icon: Trash2,
          onClick: onDelete,
          color: "danger",
          srText: "Delete",
          tooltip: "Delete",
        }
      : null,
  ];

  const enabledActions = actionConfigs.filter(
    (action): action is ActionConfig<T> => action !== null
  );

  if (enabledActions.length === 0) return null;

  return (
    <div className="flex justify-center gap-1 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
      {enabledActions.map((action) => {
        const IconComponent = action.icon;
        const colors = colorClasses[action.color];

        return (
          <div
            key={action.key}
            className="relative group/tooltip"
            style={{ zIndex: 1 }}
          >
            <AppButton
              variant="ghost"
              size="md"
              onClick={() => action.onClick(item)}
              className={`p-1.5! ${colors.hover} hover:scale-110 transition-all duration-200 relative z-10`}
            >
              <IconComponent size={size} className={colors.text} />
              <span className="sr-only">{action.srText}</span>
            </AppButton>
            {/* Left-side tooltip alternative */}
            <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 px-2 py-1 text-xs text-gray-700 bg-white border border-gray-200 rounded shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
              {action.tooltip}
              {/* Tooltip arrow pointing right */}
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-white"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
