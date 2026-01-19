import {
  AuditAction as PrismaAuditAction,
  AuditEntity as PrismaAuditEntity,
  Prisma,
} from '@prisma/client';
import {
  AuditAction,
  AuditEntity,
  AuditContext,
} from 'src/common/types/audit.types';
import { AuditLogResponseDto } from './dto/audit-response.dto';

export function mapAuditLogToDto(log: {
  id: string;
  entityType: PrismaAuditEntity;
  entityId: string;
  action: PrismaAuditAction;
  actorUserId: string | null;
  vehicleId?: string | null;
  summary: string;
  context: Prisma.JsonValue | null;
  createdAt: Date;
}): AuditLogResponseDto {
  return {
    id: log.id,
    entityType: log.entityType as AuditEntity,
    entityId: log.entityId,
    action: log.action as AuditAction,
    actorUserId: log.actorUserId,
    vehicleId: log.vehicleId,
    summary: log.summary,
    context: log.context as AuditContext | null,
    createdAt: log.createdAt,
  };
}
