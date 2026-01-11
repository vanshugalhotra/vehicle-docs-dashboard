import { Prisma } from '@prisma/client';
import { AuditContextChange, JsonObject } from 'src/common/types/audit.types';

/**
 * Normalize a value into Prisma.InputJsonValue.
 * Removes methods, symbols, undefined, and ensures JSON-safe value.
 */
function normalize<T>(
  value: T | null | undefined,
): Prisma.InputJsonValue | null {
  if (value == null) return null;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

// Fields to ignore in audit tracking
const OMIT_FIELDS = new Set(['updatedAt', 'createdAt']);

/**
 * Compute the changes between oldRecord and newRecord.
 * - CREATE: returns {}
 * - DELETE: returns {}
 * - UPDATE: shallow diff, excluding OMIT_FIELDS
 */
export function computeChanges<T>(params: {
  oldRecord?: T | null;
  newRecord?: T | null;
}): Record<string, AuditContextChange> {
  const oldSnap = normalize(params.oldRecord);
  const newSnap = normalize(params.newRecord);

  if (oldSnap == null && newSnap == null) return {};

  // Convert normalized values to JsonObject
  const oldObj = (oldSnap ?? {}) as JsonObject;
  const newObj = (newSnap ?? {}) as JsonObject;

  // ---------- CREATE ----------
  if (!oldSnap && newSnap) {
    return {}; // for create, we don't track every field
  }

  // ---------- DELETE ----------
  if (oldSnap && !newSnap) {
    return {}; // for delete, we don't track every field
  }

  // ---------- UPDATE ----------
  const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  const changes: Record<string, AuditContextChange> = {};

  for (const key of keys) {
    if (OMIT_FIELDS.has(key)) continue;

    const before = oldObj[key] ?? null;
    const after = newObj[key] ?? null;

    // skip unchanged values
    if (JSON.stringify(before) === JSON.stringify(after)) continue;

    changes[key] = { from: before, to: after };
  }

  return changes;
}
