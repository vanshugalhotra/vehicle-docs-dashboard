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

/* ======================================================
 * Mapper
 * ====================================================== */
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

/* --------------------
 * Context normalization
 * -------------------- */
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
    .filter((c) => c.from !== c.to && (c.from !== null || c.to !== null));
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

/* --------------------
 * Stringify / format values
 * -------------------- */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

function isDateString(value: string): boolean {
  const parsed = Date.parse(value);
  return !Number.isNaN(parsed);
}

function stringify(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  if (value instanceof Date) {
    return format(value, "dd MMM yyyy, hh:mm a");
  }

  if (typeof value === "string") {
    if (isUUID(value)) return null;
    if (isDateString(value))
      return format(new Date(value), "dd MMM yyyy, hh:mm a");
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
