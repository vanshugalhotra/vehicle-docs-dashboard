"use client";

import React from "react";
import { Controller, Control, FieldErrors, FieldValues } from "react-hook-form";
import { EntityField } from "./FormModal";
import { AppInput } from "../../ui/AppInput";
import { AppTextArea } from "../../ui/AppTextArea";
import { AppSelect } from "../../ui/AppSelect";
import { AppDatePicker } from "../../ui/AppDatePicker";
import { AppText } from "../../ui/AppText";

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
  const errorMessage = errors[field.key]?.message as string;
  const isRequired = field.required;

  const renderLabel = () => (
    <AppText as="label" size="label" variant="secondary" className="mb-1 block">
      {field.label}
      {isRequired && <span className="text-danger ml-1">*</span>}
    </AppText>
  );

  switch (field.type) {
    case "text":
    case "number":
      return (
        <Controller
          name={field.key}
          control={control}
          render={({ field: f }) => (
            <div>
              {renderLabel()}
              <AppInput
                {...f}
                value={f.value ?? ""}
                type={field.type}
                placeholder={field.placeholder}
                error={errorMessage}
                className="w-full"
                aria-invalid={!!errorMessage}
                aria-describedby={errorMessage ? `${field.key}-error` : undefined}
              />
            </div>
          )}
        />
      );

    case "textarea":
      return (
        <Controller
          name={field.key}
          control={control}
          render={({ field: f }) => (
            <div>
              {renderLabel()}
              <AppTextArea
                {...f}
                value={f.value ?? ""}
                label="" // Render label outside
                placeholder={field.placeholder}
                error={errorMessage}
                className="w-full"
                aria-invalid={!!errorMessage}
                aria-describedby={errorMessage ? `${field.key}-error` : undefined}
              />
              {errorMessage && (
                <AppText size="caption" variant="error" className="mt-1">
                  {errorMessage}
                </AppText>
              )}
            </div>
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
            const placeholderOption = { label: field.placeholder || "Select...", value: "" };
            const displayOptions = field.placeholder ? [placeholderOption, ...(field.options ?? [])] : field.options ?? [];
            return (
              <div>
                {renderLabel()}
                <AppSelect
                  options={displayOptions}
                  value={selectedOption || placeholderOption}
                  onChange={(opt) => f.onChange(opt.value === "" ? undefined : opt.value)}
                  label="" // Render label outside
                  error={errorMessage}
                  aria-invalid={!!errorMessage}
                  aria-describedby={errorMessage ? `${field.key}-error` : undefined}
                />
                {errorMessage && (
                  <AppText size="caption" variant="error" className="mt-1">
                    {errorMessage}
                  </AppText>
                )}
              </div>
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
            <div>
              {renderLabel()}
              <AppDatePicker
                value={f.value ?? null}
                onChange={f.onChange}
                label="" // Render label outside
                placeholder={field.placeholder}
                error={errorMessage}
                aria-invalid={!!errorMessage}
                aria-describedby={errorMessage ? `${field.key}-error` : undefined}
              />
              {errorMessage && (
                <AppText size="caption" variant="error" className="mt-1">
                  {errorMessage}
                </AppText>
              )}
            </div>
          )}
        />
      );

    default:
      return null;
  }
};