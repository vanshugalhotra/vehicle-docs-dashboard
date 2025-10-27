"use client";

import React from "react";
import clsx from "clsx";
import { AppButton } from "../../ui/AppButton";
import { AppCard } from "../../ui/AppCard";
import { FormFieldRenderer } from "./FormFieldRenderer";
import { AppText } from "../../ui/AppText";
import { useEntityForm } from "@/hooks/useEntityForm";
import type { EntityField } from "./EntityFieldTypes";
import { ZodType } from "zod";

export interface FormEmbeddedPanelProps<T extends object> {
  title?: string;
  fields: EntityField[];
  defaultValues?: Partial<T>;
  schema?: ZodType;
  selectedRecord?: T | null;
  onSubmit: (values: T) => void;
  onCancel?: () => void;
  loading?: boolean;
  layout?: "stacked" | "split";
  hoverable?: boolean;
}

export const FormEmbeddedPanel = <T extends object>({
  title,
  fields,
  schema,
  defaultValues,
  selectedRecord,
  onSubmit,
  onCancel,
  loading = false,
  layout = "stacked",
  hoverable = false,
}: FormEmbeddedPanelProps<T>) => {
  const form = useEntityForm<T>({
    fields,
    schema,
    defaultValues,
    values: selectedRecord,
    resetDeps: [selectedRecord, defaultValues],
  });

  const { handleSubmit, control, formState: { errors } } = form;

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
          <FormFieldRenderer
            key={field.key}
            field={field}
            control={control}
            errors={errors}
          />
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
