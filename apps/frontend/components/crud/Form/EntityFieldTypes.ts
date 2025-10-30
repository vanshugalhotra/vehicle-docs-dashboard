import type { ZodType } from "zod";
import type { InlineDropdownCreateConfig } from "@/components/crud/InlineDropdownCreate/InlineDropdownCreate";

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "date"
  | "number"
  | "asyncSelect";

export interface EntityField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  inlineConfig?: InlineDropdownCreateConfig;
}
export interface FormLayoutConfig {
  gridColumns?: number;
  fieldSpans?: Record<string, number>; // { fieldKey: span }
}

export type EntityFormSchema = ZodType | undefined;