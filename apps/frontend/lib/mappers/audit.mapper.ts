import type {
  AuditLogUI,
  AuditUIChange,
  AuditAction,
  AuditEntity,
  AuditContext,
} from "@/lib/types/audit.types";
import { formatDistanceToNow, format } from "date-fns";

export interface AuditLogResponseDto {
  id: string;
  entityType: AuditEntity;
  entityId: string;
  action: AuditAction;
  actorUserId?: string | null;
  summary: string;
  context?: AuditContext | null;
  createdAt: Date | string;
}

export function mapAuditLogDtoToUI(dto: AuditLogResponseDto): AuditLogUI {
  const date = new Date(dto.createdAt);

  return {
    id: dto.id,

    entityType: dto.entityType,
    entityId: dto.entityId,

    action: dto.action,

    actor: {
      id: dto.actorUserId ?? undefined,
      label: resolveActorLabel(dto),
    },

    summary: dto.summary,

    timestamp: {
      date,
      relative: formatDistanceToNow(date, { addSuffix: true }),
      absolute: format(date, "dd MMM yyyy, hh:mm a"),
    },

    context: normalizeContext(dto.context),
  };
}

/* ======================================================
 * Helpers
 * ====================================================== */

function resolveActorLabel(dto: AuditLogResponseDto): string {
  if (!dto.actorUserId) return "System";

  const source = dto.context?.meta?.source;
  if (typeof source === "string") return source;

  return "Unknown";
}

function normalizeContext(
  context: AuditLogResponseDto["context"]
): AuditLogUI["context"] | undefined {
  if (!context) return undefined;

  const changes = normalizeChanges(context.changes);
  const related = normalizeKeyValue(context.related);
  const meta = normalizeKeyValue(context.meta);

  if (
    !context.event &&
    !changes.length &&
    !Object.keys(related).length &&
    !Object.keys(meta).length
  ) {
    return undefined;
  }

  return {
    event: context.event,
    changes: changes.length ? changes : undefined,
    related: Object.keys(related).length ? related : undefined,
    meta: Object.keys(meta).length ? meta : undefined,
  };
}

function normalizeChanges(
  changes?: Record<string, { from: unknown; to: unknown }>
): AuditUIChange[] {
  if (!changes) return [];

  return Object.entries(changes)
    .map(([field, value]) => ({
      field,
      from: stringify(value.from),
      to: stringify(value.to),
    }))
    .filter((c) => c.from !== c.to);
}

function normalizeKeyValue(
  obj?: Record<string, unknown>
): Record<string, string> {
  if (!obj) return {};

  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, v]) => v !== null && v !== undefined)
      .map(([k, v]) => {
        const str = stringify(v);
        // Ensure we never return null
        return [k, str !== null ? str : ""];
      })
  );
}
function stringify(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
