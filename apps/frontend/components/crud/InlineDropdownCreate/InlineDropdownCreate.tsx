"use client";

import React, { useState } from "react";
import { AppAsyncSelect } from "../../ui/AppSelect/AppAsyncSelect";
import { EntityField } from "../Form/EntityFieldTypes";
import FormModal from "@/components/crud/Form/FormModal";
import { toastUtils } from "@/lib/utils/toastUtils";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";

export interface InlineDropdownCreateConfig<T = unknown> {
  /** GET endpoint for dropdown options */
  endpoint: string;
  /** POST endpoint for creating a new option */
  createEndpoint: string;
  /** Modal title */
  title: string;
  /** Fields for create modal */
  fields: EntityField[];
  /** Transform API response to {label, value}[] */
  transform?: (data: T[]) => { label: string; value: string }[];
}

export interface InlineDropdownCreateProps<T = unknown> {
  config: InlineDropdownCreateConfig<T>;
  value?: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  filterBy?: { key: string; value?: string };
  className?: string;
}

/**
 * Wrapper around AppAsyncSelect that adds "+Add new" inline create support.
 * Consistent with CRUD pipeline — no embedded business logic.
 */
export const InlineDropdownCreate = <T,>({
  config,
  value,
  onChange,
  label,
  placeholder,
  error,
  disabled,
  filterBy,
  className,
}: InlineDropdownCreateProps<T>) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (formData: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(config.createEndpoint, {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (!res || !(res as { id?: string }).id)
        throw new Error("Invalid response from server");

      toastUtils.success(`${config.title} created successfully`);

      setOpen(false);

      // Optional: auto-select newly created value
      onChange((res as { id: string }).id);
    } catch (err) {
      toastUtils.error((err as Error).message || "Failed to create");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppAsyncSelect
        endpoint={config.endpoint}
        value={value}
        onChange={onChange}
        label={label}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        filterBy={filterBy}
        transform={config.transform}
        allowAdd
        onAddClick={() => setOpen(true)}
        className={className}
      />

      <FormModal
        open={open}
        onClose={() => setOpen(false)}
        title={config.title}
        fields={config.fields}
        onSubmit={handleCreate}
        loading={loading}
      />
    </>
  );
};
