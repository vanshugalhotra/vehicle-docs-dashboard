"use client";

import React from "react";
import clsx from "clsx";
import { componentTokens } from "@/styles/design-system";
import { AppButton } from "../../ui/AppButton";
import { AppDialog } from "../../ui/AppDialog";
import { FormFieldRenderer } from "./FormFieldRenderer";
import { useEntityForm } from "@/hooks/useEntityForm";
import type { EntityField } from "./EntityFieldTypes";
import { ZodType } from "zod";

export interface FormModalProps<T extends object> {
  title: string;
  fields: EntityField[];
  schema?: ZodType;
  defaultValues?: Partial<T>;
  open: boolean;
  onClose: () => void;
  onSubmit: (values: T) => void;
  loading?: boolean;
}

export const FormModal = <T extends object>({
  title,
  fields,
  schema,
  defaultValues,
  open,
  onClose,
  onSubmit,
  loading = false,
}: FormModalProps<T>) => {
  const form = useEntityForm<T>({
    fields,
    schema,
    defaultValues,
    values: defaultValues,
    resetDeps: [open, defaultValues],
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  return (
    <AppDialog open={open} onClose={onClose} title={title}>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          handleSubmit((values) => onSubmit(values as T))(e);
        }}
        className={clsx("flex flex-col gap-4", componentTokens.layout.section)}
      >
        {fields.map((field) => (
          <FormFieldRenderer
            key={field.key}
            field={field}
            control={control}
            errors={errors}
          />
        ))}

        <div className="flex justify-end gap-2 pt-4 border-t border-border-subtle">
          <AppButton
            variant="outline"
            onClick={onClose}
            disabled={loading}
            size="md"
          >
            Cancel
          </AppButton>
          <AppButton
            type="submit"
            variant="primary"
            disabled={loading}
            size="md"
          >
            {loading ? "Saving..." : "Save"}
          </AppButton>
        </div>
      </form>
    </AppDialog>
  );
};

export default FormModal;
