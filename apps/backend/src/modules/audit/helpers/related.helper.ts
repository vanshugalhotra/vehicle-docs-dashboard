import { Prisma } from '@prisma/client';
import { AuditEntity } from 'src/common/types/audit.types';
import { RELATED_FIELDS } from '../mappings';
import { getByPath } from 'src/common/utils/path-utils';

function normalizeToJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

/**
 * Build the `related` context object for audit logs.
 *
 */
export function buildRelated<T>(params: {
  entityType: AuditEntity;
  record?: T | null;
}): Record<string, Prisma.InputJsonValue> {
  const { entityType, record } = params;

  const fields = RELATED_FIELDS[entityType] ?? [];
  if (!fields.length) return {};

  const source = record as Record<string, unknown> | null;
  if (!source) return {};

  const related: Record<string, Prisma.InputJsonValue> = {};

  for (const field of fields) {
    const { idField, nameField, label } = field;

    // ---- id value ----
    if (idField && idField in source) {
      const idValue = source[idField];
      if (idValue != null) {
        related[idField] = normalizeToJson(idValue);
      }
    }

    if (nameField) {
      const readable = getByPath(source, nameField);
      if (readable != null) {
        const outputKey = label ?? nameField.replace(/\./g, '_');
        related[outputKey] = normalizeToJson(readable);
      }
    }
  }

  return related;
}
