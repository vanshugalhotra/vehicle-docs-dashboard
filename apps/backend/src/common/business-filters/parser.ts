import { BadRequestException } from '@nestjs/common';

interface MissingDocsRule {
  list: string[];
  mode: 'AND' | 'OR';
}

type AllowedKeyRule =
  | 'boolean'
  | 'string[]'
  | { list: 'string[]'; mode: readonly ['AND', 'OR'] };

export function parseBusinessFilters(
  input: unknown,
  allowedKeys: Record<string, AllowedKeyRule>,
): Record<string, unknown> {
  if (!input) return {};

  let parsed: Record<string, unknown> = {};

  // ------------------------------------------------------------
  // 1. Safe JSON parse
  // ------------------------------------------------------------
  try {
    parsed =
      typeof input === 'string'
        ? (JSON.parse(input) as Record<string, unknown>)
        : (input as Record<string, unknown>);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new BadRequestException(`Invalid JSON in businessFilters: ${msg}`);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new BadRequestException(`businessFilters must be an object`);
  }

  // ------------------------------------------------------------
  // 2. Validate unknown keys
  // ------------------------------------------------------------
  const unknown = Object.keys(parsed).filter(
    (key) => !Object.keys(allowedKeys).includes(key),
  );
  if (unknown.length > 0) {
    throw new BadRequestException(
      `Unknown business filter keys: ${unknown.join(', ')}`,
    );
  }

  // ------------------------------------------------------------
  // 3. Validate values based on allowed rules
  // ------------------------------------------------------------
  for (const [key, rule] of Object.entries(allowedKeys)) {
    if (!(key in parsed)) continue;

    const value = parsed[key];

    // ------------------------------------------------------------
    // boolean
    // ------------------------------------------------------------
    if (rule === 'boolean') {
      if (typeof value !== 'boolean') {
        throw new BadRequestException(`businessFilters.${key} must be boolean`);
      }
      continue;
    }

    // ------------------------------------------------------------
    // string[]
    // ------------------------------------------------------------
    if (rule === 'string[]') {
      if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) {
        throw new BadRequestException(
          `businessFilters.${key} must be an array of strings`,
        );
      }
      continue;
    }

    // ------------------------------------------------------------
    // missingDocs { list: string[], mode: enum }
    // ------------------------------------------------------------
    if (typeof rule === 'object' && 'list' in rule && 'mode' in rule) {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new BadRequestException(
          `businessFilters.${key} must be an object { list: string[], mode: "AND" | "OR" }`,
        );
      }

      const v = value as Partial<MissingDocsRule>;

      // list validation
      if (
        !Array.isArray(v.list) ||
        !v.list.every((x) => typeof x === 'string')
      ) {
        throw new BadRequestException(
          `businessFilters.${key}.list must be an array of strings`,
        );
      }

      // mode validation
      if (typeof v.mode !== 'string' || !rule.mode.includes(v.mode)) {
        throw new BadRequestException(
          `businessFilters.${key}.mode must be one of: ${rule.mode.join(', ')}`,
        );
      }

      continue;
    }

    // ------------------------------------------------------------
    // Unknown rule form (should never happen)
    // ------------------------------------------------------------
    throw new BadRequestException(
      `Invalid rule configuration for businessFilters.${key}`,
    );
  }

  return parsed;
}
