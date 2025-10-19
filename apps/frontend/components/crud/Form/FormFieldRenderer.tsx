"use client";

import React from "react";
import { Controller, Control, FieldErrors, FieldValues } from "react-hook-form";
import { EntityField } from "./FormModal";
import { AppInput } from "../../ui/AppInput";
import { AppTextArea } from "../../ui/AppTextArea";
import { AppSelect } from "../../ui/AppSelect";
import { AppDatePicker } from "../../ui/AppDatePicker";

export interface FormFieldRendererProps {
  field: EntityField;
  control: Control<FieldValues>;
  errors: FieldErrors<FieldValues>;
}

export const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
  field,
  control,
  errors,
}) => {
  switch (field.type) {
    case "text":
    case "number":
      return (
        <Controller
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
