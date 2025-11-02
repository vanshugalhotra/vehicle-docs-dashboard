"use client";

import React, { useEffect, useState } from "react";
import { AppCard } from "@/components/ui/AppCard";
import { AppAsyncSelect } from "@/components/ui/AppSelect/AppAsyncSelect";
import { AppText } from "@/components/ui/AppText";
import { componentTokens } from "@/styles/design-system";
import { Search } from "lucide-react";
import clsx from "clsx";

export interface FieldDefinition {
  label: string;
  value?: string | null;
  icon?: React.ReactNode;
}

export interface EntitySelectorProps<T extends { id: string }> {
  /** Display label for the select */
  label?: string;

  /** Endpoint for fetching list and detail (should return T[]) */
  endpoint: string;

  /** Transforms fetched list items into select options */
  transformOption: (data: T[]) => { label: string; value: string }[];

  /** Defines what fields to show when item is selected */
  renderFields: (item: T) => FieldDefinition[];

  /** Placeholder text for the select */
  placeholder?: string;

  /** Optional callback when item is selected or cleared */
  onSelect?: (item: T | null) => void;
}

export const EntitySelector = <T extends { id: string }>({
  label,
  endpoint,
  transformOption,
  renderFields,
  placeholder = "Search or select...",
  onSelect,
}: EntitySelectorProps<T>) => {
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedId) {
        setSelectedItem(null);
        onSelect?.(null);
        return;
      }

      try {
        const res = await fetch(`${endpoint}/${selectedId}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data: T = await res.json();
        setSelectedItem(data);
        onSelect?.(data);
      } catch (err) {
        console.error("EntitySelector fetch error:", err);
        setSelectedItem(null);
        onSelect?.(null);
      }
    };

    fetchDetails();
  }, [selectedId, endpoint, onSelect]);

  return (
    <div className="flex flex-col gap-4">
      {/* 🔽 Async select */}
      <AppAsyncSelect<T>
        label={label}
        endpoint={endpoint}
        value={selectedId}
        onChange={setSelectedId}
        placeholder={placeholder}
        transform={transformOption}
      />

      {/* 📋 Details card */}
      {selectedItem ? (
        <AppCard bordered hoverable className={componentTokens.card.interactive}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {renderFields(selectedItem).map((field, idx) => (
              <EntityField
                key={idx}
                label={field.label}
                value={field.value}
                icon={field.icon}
              />
            ))}
          </div>
        </AppCard>
      ) : (
        <EmptyState label={label} />
      )}
    </div>
  );
};

const EntityField = ({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | null;
  icon?: React.ReactNode;
}) => (
  <div className={clsx(
    "space-y-0.5 rounded-md p-2 border border-border-subtle/80 hover:bg-primary/10 transition-all duration-150"
  )}>
    <AppText size="label" variant="secondary">
      {label}
    </AppText>
    <div className="flex items-center gap-2">
      {icon}
      <AppText size="caption" variant="primary">
        {value ?? "—"}
      </AppText>
    </div>
  </div>
);

const EmptyState = ({ label }: { label?: string }) => (
  <AppCard className={componentTokens.card.base}>
    <div className="flex flex-col items-center justify-center p-4 bg-surface-subtle text-center rounded-lg">
      <div className="bg-primary-light/80 p-2 rounded-full mb-2">
        <Search className="w-5 h-5 text-primary" />
      </div>
      <AppText size="heading2" variant="primary">
        {label ? `No ${label} Selected` : "No Selection"}
      </AppText>
      <AppText size="body" variant="secondary">
        Search and select a record to view its details.
      </AppText>
    </div>
  </AppCard>
);