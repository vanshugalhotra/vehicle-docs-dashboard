"use client";

import React, { useEffect } from "react";
import { z, ZodType } from "zod";
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { componentTokens } from "@/styles/design-system";
import { AppButton } from "../../ui/AppButton";
import { AppDialog } from "../../ui/AppDialog";
import { FormFieldRenderer } from "./FormFieldRenderer";
import { InlineDropdownCreateConfig } from "@/components/crud/InlineDropdownCreate/InlineDropdownCreate";

export type FieldType = "text" | "textarea" | "select" | "date" | "number" | "asyncSelect";

export interface EntityField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  inlineConfig?: InlineDropdownCreateConfig;

}

export interface FormModalProps<T extends object> {
  title: string;
  fields: EntityField[];
  defaultValues?: Partial<T>;
  schema?: ZodType;
  open: boolean;
  onClose: () => void;
  onSubmit: (values: T) => void;
  loading?: boolean;
}

export const FormModal = <T extends object>({
  title,
  fields,
  defaultValues,
  schema,
  open,
  onClose,
  onSubmit,
  loading = false,
}: FormModalProps<T>) => {
  // Fallback schema from field requirements
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

  useEffect(() => {
    if (open) reset(defaultValues);
  }, [open, defaultValues, reset]);

  return (
    <AppDialog open={open} onClose={onClose} title={title}>
      <form
        onSubmit={handleSubmit((values) => onSubmit(values as T))}
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
          <AppButton variant="outline" onClick={onClose} disabled={loading} size="md">
            Cancel
          </AppButton>
          <AppButton type="submit" variant="primary" disabled={loading} size="md">
            {loading ? "Saving..." : "Save"}
          </AppButton>
        </div>
      </form>
    </AppDialog>
  );
};

export default FormModal;