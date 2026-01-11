import { AuditAction, AuditEntity } from 'src/common/types/audit.types';

export function resolveEvent(input: {
  entityType: AuditEntity;
  action: AuditAction;
}): string {
  // basic default fallback
  return `${input.entityType}_${input.action}`;
}
