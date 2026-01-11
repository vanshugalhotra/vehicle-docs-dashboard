import { Prisma } from '@prisma/client';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum AuditEntity {
  USER = 'USER',
  VEHICLE = 'VEHICLE',
  VEHICLE_DOCUMENT = 'VEHICLE_DOCUMENT',
  OWNER = 'OWNER',
  DRIVER = 'DRIVER',
  LOCATION = 'LOCATION',
  DOCUMENT_TYPE = 'DOCUMENT_TYPE',
  REMINDER = 'REMINDER',
}

// ==============================
// Context contract
// ==============================

export interface AuditContextChange {
  from: Prisma.JsonValue;
  to: Prisma.JsonValue;
}

export type AuditContext = Prisma.InputJsonObject & {
  event: string;
  changes: Record<string, AuditContextChange>;
  related: Record<string, Prisma.JsonValue>;
  meta: Record<string, Prisma.JsonValue>;
};

// ==============================
// Payload used to create audit logs
// ==============================

export interface AuditPayload {
  entityType: AuditEntity;
  entityId: string;

  action: AuditAction;
  actorUserId?: string | null;

  summary: string; // human-readable
  context: AuditContext; // structured JSON
}

// ==============================
// Shape of stored DB record
// ==============================

export interface AuditLogRecord {
  id: string;

  entityType: AuditEntity;
  entityId: string;

  action: AuditAction;
  actorUserId?: string | null;

  summary: string;
  context?: AuditContext | null;

  createdAt: Date;
}

export interface AuditRecordParams<T = any> {
  entityType: AuditEntity;
  entityId: string;
  action: AuditAction;

  actorUserId?: string | null; // optional, can be resolved inside AuditService

  oldRecord?: T | null;
  newRecord?: T | null;
}
