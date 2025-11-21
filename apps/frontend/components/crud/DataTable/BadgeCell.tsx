"use client";

import { AppBadge, BadgeVariant } from "@/components/ui/AppBadge";

interface GenericBadgeListProps {
  items?: { id: string; name: string }[];
  maxVisible?: number; 
  badgeVariant?: BadgeVariant; 
  emptyPlaceholder?: React.ReactNode;
}

export function BadgeCell({
  items,
  maxVisible = 3,
  badgeVariant = "success",
  emptyPlaceholder = <span className="text-xs text-gray-400">—</span>,
}: GenericBadgeListProps) {
  if (!items?.length) return emptyPlaceholder;

  const preview = items.slice(0, maxVisible);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {preview.map((item) => (
        <AppBadge key={item.id} variant={badgeVariant}>
          {item.name}
        </AppBadge>
      ))}

      {items.length > maxVisible && (
        <span className="text-xs text-gray-400">
          +{items.length - maxVisible} more
        </span>
      )}
    </div>
  );
}
