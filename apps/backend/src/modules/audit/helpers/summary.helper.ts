import {
  SUMMARY_SUBJECT_MAPPING,
  UPDATE_RULES,
  EntityModelMap,
  UpdateRulesMap,
  UpdateRule,
} from '../mappings';
import {
  AuditAction,
  AuditEntity,
  AuditContext,
} from 'src/common/types/audit.types';
import { getByPath } from 'src/common/utils/path-utils';
import { Prisma } from '@prisma/client';

function resolvePlaceholder(
  record: Record<string, unknown> | null,
  path: string,
  fallback: string,
): string {
  if (!record) return fallback;

  const value = getByPath(record, path);

  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }

  if (
    Array.isArray(value) ||
    (typeof value === 'object' && value.constructor === Object)
  ) {
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }

  return fallback;
}

/**
 * Build subject from mapping template
 */
function buildSubjectFromMapping(
  entity: AuditEntity,
  record: Record<string, unknown> | null,
): string | null {
  const mapping = SUMMARY_SUBJECT_MAPPING[entity];
  if (!mapping) return null;

  let subject = mapping.template;

  for (const [key, config] of Object.entries(mapping.placeholders)) {
    const resolved = resolvePlaceholder(record, config.path, config.fallback);
    subject = subject.replace(`<${key}>`, resolved);
  }

  return subject.trim();
}

/**
 * Whether field changed at all
 */
function hasChangedField(field: string, context: AuditContext): boolean {
  return Object.hasOwn(context.changes, field);
}

/**
 * Safely read before/after pairs for fields
 */
function buildBeforeAfterForFields(
  fields: readonly string[],
  context: AuditContext,
): {
  before: Record<string, Prisma.InputJsonValue | null>;
  after: Record<string, Prisma.InputJsonValue | null>;
} {
  const before: Record<string, Prisma.InputJsonValue | null> = {};
  const after: Record<string, Prisma.InputJsonValue | null> = {};

  for (const field of fields) {
    const change = context.changes[field];
    if (!change) continue;

    before[field] = change.from ?? null;
    after[field] = change.to ?? null;
  }

  return { before, after };
}

function buildUpdateSummary<K extends keyof UpdateRulesMap>(params: {
  entityType: K;
  subject: string;
  context: AuditContext;
}): string {
  const { entityType, subject, context } = params;

  // Correctly typed rule list
  const rules: UpdateRule<EntityModelMap[K]>[] = UPDATE_RULES[entityType] ?? [];

  // Strongly typed matched list
  const matched: UpdateRule<EntityModelMap[K]>[] = [];

  for (const rule of rules) {
    // 1) Did any relevant field change?
    const anyFieldChanged = rule.fields.some((f) =>
      hasChangedField(String(f), context),
    );

    if (!anyFieldChanged) continue;

    // 2) If no condition -> instantly matches
    if (!rule.condition) {
      matched.push(rule);
      continue;
    }

    // 3) Build before / after snapshot ONLY for fields involved
    const { before, after } = buildBeforeAfterForFields(
      rule.fields.map(String),
      context,
    );

    // 4) Safe condition execution
    if (
      rule.condition(
        before as unknown as EntityModelMap[K],
        after as unknown as EntityModelMap[K],
      )
    ) {
      matched.push(rule);
    }
  }

  if (matched.length === 0) {
    return `${subject} was updated`;
  }

  matched.sort((a, b) => Number(a.priority ?? 999) - Number(b.priority ?? 999));

  const mainMessage = matched[0]?.message ?? 'was updated';

  if (matched.length > 1) {
    return `${subject} ${mainMessage} + other updates`;
  }

  return `${subject} ${mainMessage}`;
}

export function buildSummary<T>(params: {
  entityType: AuditEntity;
  action: AuditAction;
  context: AuditContext;
  record: T | null;
}): string {
  const { entityType, action, context, record } = params;

  const subject = buildSubjectFromMapping(
    entityType,
    record as unknown as Record<string, unknown> | null,
  );

  const fallbackSubject = subject || entityType.toLowerCase();

  switch (action) {
    case AuditAction.CREATE:
      return `${fallbackSubject} was created`;

    case AuditAction.DELETE:
      return `${fallbackSubject} was deleted`;

    case AuditAction.UPDATE:
      return buildUpdateSummary({
        entityType: entityType as keyof UpdateRulesMap,
        subject: fallbackSubject,
        context,
      });

    default:
      return `${fallbackSubject} was updated`;
  }
}
