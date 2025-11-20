import { BadRequestException } from '@nestjs/common';

interface MissingDocsRule {
  list: string[];
  mode: 'AND' | 'OR';
}

interface StatusFilterObject {
  type: 'expired' | 'active' | 'expiringSoon';
  withinDays?: number;
}

type AllowedKeyRule =
  | 'boolean'
  | 'string[]'
  | { list: 'string[]'; mode: readonly ['AND', 'OR'] }
  | readonly string[]
  | 'statusWithOptionalNumber'; // our new status filter type

export function parseBusinessFilters(
  input: unknown,
  allowedKeys: Record<string, AllowedKeyRule>,
): Record<string, unknown> {
  if (!input) return {};

  let parsed: Record<string, unknown> = {};

  // 1. Safe JSON parse
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

  // 2. Validate unknown keys
  const unknownKeys = Object.keys(parsed).filter(
    (key) => !Object.keys(allowedKeys).includes(key),
  );
  if (unknownKeys.length > 0) {
    throw new BadRequestException(
      `Unknown business filter keys: ${unknownKeys.join(', ')}`,
    );
  }

  // 3. Validate values
  for (const [key, rule] of Object.entries(allowedKeys)) {
    if (!(key in parsed)) continue;

    const value = parsed[key];

    // boolean
    if (rule === 'boolean') {
      if (typeof value !== 'boolean') {
        throw new BadRequestException(`businessFilters.${key} must be boolean`);
      }
      continue;
    }

    // string[]
    if (rule === 'string[]') {
      if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) {
        throw new BadRequestException(
          `businessFilters.${key} must be an array of strings`,
        );
      }
      continue;
    }

    // missingDocs { list: string[], mode: enum }
    if (typeof rule === 'object' && 'list' in rule && 'mode' in rule) {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new BadRequestException(
          `businessFilters.${key} must be an object { list: string[], mode: "AND" | "OR" }`,
        );
      }

      const v: Partial<MissingDocsRule> = value as Partial<MissingDocsRule>;

      if (
        !Array.isArray(v.list) ||
        !v.list.every((x) => typeof x === 'string')
      ) {
        throw new BadRequestException(
          `businessFilters.${key}.list must be an array of strings`,
        );
      }

      if (typeof v.mode !== 'string' || !rule.mode.includes(v.mode)) {
        throw new BadRequestException(
          `businessFilters.${key}.mode must be one of: ${rule.mode.join(', ')}`,
        );
      }
      continue;
    }

    // literal enums
    if (Array.isArray(rule) && rule.every((v) => typeof v === 'string')) {
      if (!rule.includes(value as string)) {
        throw new BadRequestException(
          `businessFilters.${key} must be one of: ${rule.join(', ')}`,
        );
      }
      continue;
    }

    // statusWithOptionalNumber
    if (rule === 'statusWithOptionalNumber') {
      // string shortcut
      if (
        typeof value === 'string' &&
        ['expired', 'active', 'expiringSoon'].includes(value)
      ) {
        continue;
      }

      // object with optional withinDays
      if (
        typeof value === 'object' &&
        value !== null &&
        'type' in value &&
        typeof (value as StatusFilterObject).type === 'string' &&
        ['expired', 'active', 'expiringSoon'].includes(
          (value as StatusFilterObject).type,
        )
      ) {
        const statusObj = value as StatusFilterObject;
        if (
          'withinDays' in statusObj &&
          typeof statusObj.withinDays !== 'number'
        ) {
          throw new BadRequestException(
            `businessFilters.${key}.withinDays must be a number`,
          );
        }
        continue;
      }

      throw new BadRequestException(
        `businessFilters.${key} must be either a string ("expired"|"active"|"expiringSoon") or an object { type: "expired"|"active"|"expiringSoon", withinDays?: number }`,
      );
    }

    throw new BadRequestException(
      `Invalid rule configuration for businessFilters.${key}`,
    );
  }

  return parsed;
}
