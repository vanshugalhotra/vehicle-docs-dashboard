"use client";

import React, { useEffect } from "react";
import { z, ZodType } from "zod";
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { AppButton } from "../../ui/AppButton";
import { AppCard } from "../../ui/AppCard";
import { FormFieldRenderer } from "./FormFieldRenderer";
import { AppText } from "../../ui/AppText";
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
  layout?: "stacked" | "split";
  hoverable?: boolean;
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
  hoverable = false,
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
    else {
      reset(defaultValues);
    }
  }, [selectedRecord, defaultValues, reset]);

  return (
    <AppCard className="flex flex-col" hoverable={hoverable}>
      {title && (
        <AppText
          size="heading3"
          variant="primary"
          className="font-semibold my-3 block"
        >
          {title}
        </AppText>
      )}

      <form
        onSubmit={handleSubmit((values) => onSubmit(values as T))}
        className={clsx(
          "flex flex-col gap-6 w-full",
          layout === "split" && "grid md:grid-cols-2 gap-8"
        )}
      >
        {fields.map((field) => (
          <div key={field.key} className="space-y-1 w-full">
            <FormFieldRenderer
              field={field}
              control={control}
              errors={errors}
            />
          </div>
        ))}

        <div className="flex justify-end gap-3 pt-6 mt-auto">
          {onCancel && (
            <AppButton
              variant="outline"
              type="button"
              onClick={onCancel}
              disabled={loading}
              size="md"
            >
              Cancel
            </AppButton>
          )}
          <AppButton
            type="submit"
            variant="primary"
            disabled={loading}
            size="md"
          >
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
