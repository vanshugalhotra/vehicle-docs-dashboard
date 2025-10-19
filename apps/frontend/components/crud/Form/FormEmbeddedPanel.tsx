"use client";

import React, { useEffect } from "react";
import { z, ZodType } from "zod";
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { AppButton } from "../../ui/AppButton";
import { AppCard } from "../../ui/AppCard";
import { transition } from "../../tokens/designTokens";
import { FormFieldRenderer } from "./FormFieldRenderer";
import type { EntityField } from "./FormModal";

export interface FormEmbeddedPanelProps<T extends object> {
  title?: string;
  fields: EntityField[];
  defaultValues?: Partial<T>;
  schema?: ZodType;
  selectedRecord?: T | null; // For edit mode
  onSubmit: (values: T) => void;
  onCancel?: () => void;
  loading?: boolean;
  layout?: "stacked" | "split"; // stacked = full width; split = grid
}

/**
 * FormEmbeddedPanel
 * Always-visible CRUD form (used for embedded form mode)
 */
export const FormEmbeddedPanel = <T extends object>({
  title,
  fields,
  defaultValues,
  schema,
  selectedRecord,
  onSubmit,
  onCancel,
  loading = false,
  layout = "stacked",
}: FormEmbeddedPanelProps<T>) => {
  // build fallback schema
  const zodSchema =
    schema ??
    z.object(
      fields.reduce((acc, f) => {
        acc[f.key] = f.required
          ? z.string().min(1, `${f.label} is required`)
          : z.string().optional();
        return acc;
      }, {} as Record<string, ZodType>)
    );

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: zodResolver(zodSchema as never),
    defaultValues,
  });

  // if editing existing record, reset form
  useEffect(() => {
    if (selectedRecord) reset(selectedRecord);
    else reset(defaultValues);
  }, [selectedRecord, defaultValues, reset]);

  return (
    <AppCard className={clsx("p-6 flex flex-col gap-6", transition.base)}>
      {title && <h2 className="text-lg font-semibold">{title}</h2>}

      <form
        onSubmit={handleSubmit((values) => onSubmit(values as T))}
        className={clsx(
          "flex flex-col gap-4",
          layout === "split" && "grid md:grid-cols-2 gap-6"
        )}
      >
        {fields.map((field) => (
          <FormFieldRenderer
            key={field.key}
            field={field}
            control={control}
            errors={errors}
          />
        ))}

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 mt-2">
          {onCancel && (
            <AppButton
              variant="outline"
              type="button"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </AppButton>
          )}
          <AppButton type="submit" variant="primary" disabled={loading}>
            {loading
              ? selectedRecord
                ? "Updating..."
                : "Saving..."
              : selectedRecord
              ? "Update"
              : "Save"}
          </AppButton>
        </div>
      </form>
    </AppCard>
  );
};

export default FormEmbeddedPanel;
