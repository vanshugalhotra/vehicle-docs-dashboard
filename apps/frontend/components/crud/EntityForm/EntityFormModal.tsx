"use client";

import React, { useEffect } from "react";
import { z, ZodType } from "zod";
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { AppButton } from "../../ui/AppButton";
import { AppDialog } from "../../ui/AppDialog";
import { transition } from "../../tokens/designTokens";
import { FormFieldRenderer } from "./FormFieldRenderer";

export type FieldType = "text" | "textarea" | "select" | "date" | "number";

export interface EntityField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export interface EntityFormModalProps<T extends object> {
  title: string;
  fields: EntityField[];
  defaultValues?: Partial<T>;
  schema?: ZodType;
  open: boolean;
  onClose: () => void;
  onSubmit: (values: T) => void;
  loading?: boolean;
}

export const EntityFormModal = <T extends object>({
  title,
  fields,
  defaultValues,
  schema,
  open,
  onClose,
  onSubmit,
  loading = false,
}: EntityFormModalProps<T>) => {
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
        className={clsx("flex flex-col gap-4", transition.base)}
      >
        {fields.map((field) => (
          <FormFieldRenderer
            key={field.key}
            field={field}
            control={control}
            errors={errors}
          />
        ))}

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <AppButton variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </AppButton>
          <AppButton type="submit" variant="primary" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </AppButton>
        </div>
      </form>
    </AppDialog>
  );
};

export default EntityFormModal;
