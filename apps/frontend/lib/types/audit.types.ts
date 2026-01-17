import type { LucideIcon } from "lucide-react";
import {
  Car,
  Pencil,
  Trash2,
  MapPin,
  FileText,
  Calendar,
  Hash,
  DollarSign,
  StickyNote,
  User,
  Phone,
  Mail,
  Key,
  Users,
  Tag,
  PlusCircle,
} from "lucide-react";
export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export enum AuditEntity {
  USER = "USER",
  VEHICLE = "VEHICLE",
  VEHICLE_DOCUMENT = "VEHICLE_DOCUMENT",
  OWNER = "OWNER",
  DRIVER = "DRIVER",
  LOCATION = "LOCATION",
  DOCUMENT_TYPE = "DOCUMENT_TYPE",
}

type JsonPrimitive = string | number | boolean | null;
type JsonArray = JsonValue[];
type JsonObject = { [key: string]: JsonValue };

export type JsonValue = JsonPrimitive | JsonArray | JsonObject;

export interface AuditContextChange {
  from: JsonValue | null;
  to: JsonValue | null;
}

export type AuditContext = {
  event: string;
  changes: Record<string, AuditContextChange>;
  related: Record<string, JsonValue>;
  meta: Record<string, JsonValue>;
};

export interface AuditLogUI {
  id: string;

  entityType: AuditEntity;
  entityId: string;

  action: AuditAction;

  actor: {
    id?: string;
    label: string;
  };

  summary: string;

  timestamp: {
    date: Date;
    relative: string;
    absolute: string;
  };

  context?: {
    event?: string;
    changes?: AuditUIChange[];
    related?: Record<string, string>;
    meta?: Record<string, string>;
  };
}

export interface AuditUIChange {
  field: string;
  from?: string | null;
  to?: string | null;
}

export const AUDIT_EVENT_ICON_MAP: Record<string, LucideIcon> = {
  // Vehicle Events
  "vehicle.location_changed": MapPin,
  "vehicle.created": Car,
  "vehicle.updated": Pencil,
  "vehicle.deleted": Trash2,
  "vehicle.driver_assigned": User,
  "vehicle.owner_assigned": Users,
  "vehicle.identifiers_changed": Hash,

  // Vehicle Document Events
  "vehicle_document.renewed": FileText,
  "vehicle_document.expiry_preponed": Calendar,
  "vehicle_document.number_changed": Hash,
  "vehicle_document.amount_changed": DollarSign,
  "vehicle_document.start_date_changed": Calendar,
  "vehicle_document.notes_changed": StickyNote,
  "vehicle_document.created": FileText,
  "vehicle_document.updated": Pencil,
  "vehicle_document.deleted": Trash2,

  // Driver Events
  "driver.name_changed": User,
  "driver.phone_changed": Phone,
  "driver.email_changed": Mail,
  "driver.created": User,
  "driver.updated": Pencil,
  "driver.deleted": Trash2,

  // Owner Events
  "owner.name_changed": Users,
  "owner.created": Users,
  "owner.updated": Pencil,
  "owner.deleted": Trash2,

  // Location Events
  "location.name_changed": MapPin,
  "location.created": MapPin,
  "location.updated": Pencil,
  "location.deleted": Trash2,

  // Document Type Events
  "document_type.name_changed": Tag,
  "document_type.created": Tag,
  "document_type.updated": Pencil,
  "document_type.deleted": Trash2,

  // User Events
  "user.email_changed": Mail,
  "user.password_changed": Key,
  "user.created": User,
  "user.updated": Pencil,
  "user.deleted": Trash2,
};

export const AUDIT_ACTION_ICON_MAP: Record<AuditAction, LucideIcon> = {
  CREATE: PlusCircle,
  UPDATE: Pencil,
  DELETE: Trash2,
};

export function resolveAuditIcon(log: AuditLogUI): LucideIcon {
  if (log.context?.event && AUDIT_EVENT_ICON_MAP[log.context.event]) {
    return AUDIT_EVENT_ICON_MAP[log.context.event];
  }

  return AUDIT_ACTION_ICON_MAP[log.action];
}

export function resolveBadgeVariant(
  action: AuditAction
): "neutral" | "success" | "warning" | "danger" | "info" {
  switch (action) {
    case AuditAction.CREATE:
      return "success";
    case AuditAction.DELETE:
      return "danger";
    case AuditAction.UPDATE:
      return "warning";
    default:
      return "info";
  }
}
