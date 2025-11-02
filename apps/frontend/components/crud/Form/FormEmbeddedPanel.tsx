"use client";

import React from "react";
import clsx from "clsx";
import { AppButton } from "../../ui/AppButton";
import { AppCard } from "../../ui/AppCard";
import { FormFieldRenderer } from "./FormFieldRenderer";
import { AppText } from "../../ui/AppText";
import { useEntityForm } from "@/hooks/useEntityForm";
import { componentTokens } from "@/styles/design-system/componentTokens";
import type { EntityField, FormLayoutConfig } from "./EntityFieldTypes";
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
  layout?: FormLayoutConfig;
  hoverable?: boolean;
  isEditMode?: boolean;
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
  layout,
  hoverable = false,
  isEditMode = false,
}: FormEmbeddedPanelProps<T>) => {
  const form = useEntityForm<T>({
    fields,
    schema,
    defaultValues,
    values: selectedRecord,
    resetDeps: [selectedRecord, defaultValues],
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  const gridColumns = layout?.gridColumns || 1;
  const isGridLayout = gridColumns > 1;

  const getSpanClass = (field: EntityField) => {
    const span = layout?.fieldSpans?.[field.key] || 1;

    switch (span) {
      case 2:
        return "col-span-2";
      case 3:
        return "col-span-3";
      case 4:
        return "col-span-4";
      default:
        return "";
    }
  };

  const getGridClass = () => {
    switch (gridColumns) {
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-3";
      case 4:
        return "grid-cols-1 md:grid-cols-4";
      default:
        return "grid-cols-1";
    }
  };

  const getButtonSpanClass = () => {
    switch (gridColumns) {
      case 2:
        return "col-span-2";
      case 3:
        return "col-span-3";
      case 4:
        return "col-span-4";
      default:
        return "";
    }
  };

  return (
    <AppCard className="flex flex-col" hoverable={hoverable}>
      {title && (
        <AppText
          size="heading3"
          variant="primary"
          className={componentTokens.text.sizes.heading3}
        >
          {title}
        </AppText>
      )}

      <form
        onSubmit={handleSubmit((values) => onSubmit(values as T))}
        className={clsx(
          "grid gap-4 w-full",
          isGridLayout ? getGridClass() : "flex flex-col"
        )}
      >
        {fields.map((field) => (
          <div key={field.key} className={getSpanClass(field)}>
            <FormFieldRenderer
              field={field}
              control={control}
              errors={errors}
            />
          </div>
        ))}

        {/* Submit buttons */}
        <div
          className={clsx(
            "flex justify-end gap-2 pt-4",
            isGridLayout && getButtonSpanClass()
          )}
        >
          {onCancel && (
            <AppButton
              variant="secondary"
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
            className="min-w-24 w-full sm:w-auto"
          >
            {loading
              ? isEditMode
                ? "Updating..."
                : "Saving..."
              : isEditMode
              ? "Update"
              : "Save"}
          </AppButton>
        </div>
      </form>
    </AppCard>
  );
};

export default FormEmbeddedPanel;
