"use client";

import { useEffect } from "react";
import { useForm, FieldValues } from "react-hook-form";
import { z, ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { EntityField } from "@/components/crud/Form/EntityFieldTypes";

interface UseEntityFormOptions<T extends object> {
  fields: EntityField[];
  schema?: ZodType; // optional external validation schema (Zod)
  defaultValues?: Partial<T>;
  values?: Partial<T> | null; // for edit mode
  resetDeps?: unknown[];
}

/**
 * Centralized form logic shared by FormModal & FormEmbeddedPanel
 */
export function useEntityForm<T extends object>({
  fields,
  schema,
  defaultValues,
  values,
  resetDeps = [],
}: UseEntityFormOptions<T>) {
  // Auto-generate a fallback Zod schema if none provided
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

  const form = useForm<FieldValues>({
    resolver: zodResolver(zodSchema as never),
    defaultValues,
  });

  // Sync when editing or when external values change
  useEffect(() => {
    if (values && Object.keys(values).length > 0) {
      form.reset(values);
    } else {
      form.reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  return form;
}
