"use client";

import React, { useEffect } from "react";
import { z, ZodType } from "zod";
import { useForm, Controller, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { AppButton } from "../ui/AppButton";
import { AppDialog } from "../ui/AppDialog";
import { AppInput } from "../ui/AppInput";
import { AppTextArea } from "../ui/AppTextArea";
import { AppSelect, Option as AppSelectOption } from "../ui/AppSelect";
import { AppDatePicker } from "../ui/AppDatePicker";
import { transition} from "../tokens/designTokens";

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "date"
  | "number";

export interface EntityField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: AppSelectOption[];
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

  // fallback schema from fields
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

  const renderField = (field: EntityField) => {
    switch (field.type) {
      case "text":
      case "number":
        return (
          <Controller
            key={field.key}
            name={field.key}
            control={control}
            render={({ field: f }) => (
              <AppInput
                {...f}
                value={f.value ?? ""}
                type={field.type}
                label={field.label}
                placeholder={field.placeholder}
                error={errors[field.key]?.message as string}
              />
            )}
          />
        );

      case "textarea":
        return (
          <Controller
            key={field.key}
            name={field.key}
            control={control}
            render={({ field: f }) => (
              <AppTextArea
                {...f}
                value={f.value ?? ""}
                label={field.label}
                placeholder={field.placeholder}
                error={errors[field.key]?.message as string}
              />
            )}
          />
        );

      case "select":
        return (
          <Controller
            key={field.key}
            name={field.key}
            control={control}
            render={({ field: f }) => {
              const selectedOption = field.options?.find(
                (o) => o.value === f.value
              );
              return (
                <AppSelect
                  options={field.options ?? []}
                  value={selectedOption}
                  onChange={(opt) => f.onChange(opt.value)}
                  label={field.label}
                  error={errors[field.key]?.message as string}
                />
              );
            }}
          />
        );

      case "date":
        return (
          <Controller
            key={field.key}
            name={field.key}
            control={control}
            render={({ field: f }) => (
              <AppDatePicker
                value={f.value ?? null}
                onChange={f.onChange}
                label={field.label}
                error={errors[field.key]?.message as string}
              />
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <AppDialog open={open} onClose={onClose} title={title}>
      <form
        onSubmit={handleSubmit((values) => onSubmit(values as T))}
        className={clsx("flex flex-col gap-4", transition.base)}
      >
        {fields.map(renderField)}

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
