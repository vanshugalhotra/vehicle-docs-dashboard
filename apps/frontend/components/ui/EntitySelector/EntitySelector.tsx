"use client";

import React, { useEffect, useState, useRef } from "react";
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

export type EntitySelectorVariant = "detailed" | "simple";

export interface EntitySelectorProps<T extends { id: string }> {
  label?: string;
  endpoint: string;
  transformOption: (data: T[]) => { label: string; value: string }[];
  renderFields?: (item: T) => FieldDefinition[];
  simpleValue?: (item: T) => string;
  variant?: EntitySelectorVariant;
  placeholder?: string;
  onSelect?: (item: T | null) => void;
  value?: string;
}

export const EntitySelector = <T extends { id: string }>({
  label,
  endpoint,
  transformOption,
  renderFields,
  simpleValue,
  variant = "detailed",
  placeholder = "Select....",
  onSelect,
  value,
}: EntitySelectorProps<T>) => {
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const selectedIdRef = useRef(selectedId);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    if (value && value !== selectedIdRef.current) {
      setSelectedId(value);
    }
  }, [value]);

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

  const isSimple = variant === "simple";

  return (
    <div className="flex flex-col gap-4">
      <AppAsyncSelect<T>
        label={label}
        endpoint={endpoint}
        value={selectedId}
        onChange={setSelectedId}
        placeholder={placeholder}
        transform={transformOption}
      />

      {selectedItem ? (
        <AppCard
          bordered
          hoverable
          className={componentTokens.card.interactive}
        >
          {isSimple ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <AppText size="heading1" variant="primary" className="font-bold">
                {simpleValue?.(selectedItem) || ""}
              </AppText>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {renderFields?.(selectedItem).map((field, idx) => (
                <EntityField
                  key={idx}
                  label={field.label}
                  value={field.value}
                  icon={field.icon}
                />
              ))}
            </div>
          )}
        </AppCard>
      ) : (
        <EmptyState label={label} variant={variant} />
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
  <div
    className={clsx(
      "space-y-0.5 rounded-md p-2 border border-border-subtle/80 hover:bg-primary/10 transition-all duration-150"
    )}
  >
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

const EmptyState = ({
  label,
  variant,
}: {
  label?: string;
  variant?: EntitySelectorVariant;
}) => (
  <AppCard className={componentTokens.card.base}>
    <div className="flex flex-col items-center justify-center p-4 bg-surface-subtle text-center rounded-lg">
      <div className="bg-primary-light/80 p-2 rounded-full mb-2">
        <Search className="w-5 h-5 text-primary" />
      </div>
      <AppText size="heading2" variant="primary">
        {label ? `No ${label} Selected` : "No Selection"}
      </AppText>
      <AppText size="body" variant="secondary">
        {variant === "simple"
          ? `Select to view.`
          : `Select a record to view its details.`}
      </AppText>
    </div>
  </AppCard>
);
