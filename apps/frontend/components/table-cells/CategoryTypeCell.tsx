"use client";
import { AppBadge } from "@/components/ui/AppBadge";

export function CategoryTypesCell({ types }: { types?: { id: string; name: string }[] }) {
  if (!types?.length) return <span className="text-xs text-gray-400">—</span>;
  const preview = types.slice(0, 3);
  return (
    <div className="flex flex-wrap items-center gap-1">
      {preview.map((t) => (
        <AppBadge key={t.id} variant="success" className="">
          {t.name}
        </AppBadge>
      ))}
      {types.length > 3 && (
        <span className="text-xs text-gray-400">+{types.length - 3} more</span>
      )}
    </div>
  );
}
