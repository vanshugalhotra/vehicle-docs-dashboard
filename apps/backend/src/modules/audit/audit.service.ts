import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService, LogContext } from 'src/common/logger/logger.service';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';

import {
  AuditAction,
  AuditEntity,
  AuditContext,
  AuditPayload,
  AuditLogRecord,
  AuditRecordParams,
} from 'src/common/types/audit.types';
import { computeChanges, resolveEvent, buildRelated } from './helpers';

@Injectable()
export class AuditService {
  private readonly entity = 'Audit';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async record<T>(params: AuditRecordParams<T>): Promise<AuditLogRecord> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'record',
      additional: {
        entityType: params.entityType,
        entityId: params.entityId,
        auditAction: params.action,
      },
    };

    this.logger.logDebug('Recording audit log', ctx);

    try {
      // 1) Build structured context
      const context = this.buildContext<T>({
        entityType: params.entityType,
        action: params.action,
        oldRecord: params.oldRecord,
        newRecord: params.newRecord,
      });

      // 2) Build human-readable summary
      const summary = this.generateSummary({
        entityType: params.entityType,
        action: params.action,
        context,
      });

      // 3) Resolve actorUserId (for now just passthrough — later auto-detect)
      const actorUserId = params.actorUserId ?? null;

      // 4) Persist to DB
      const record = await this.persist({
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        actorUserId,
        summary,
        context,
      });

      this.logger.logDebug('Audit log written', {
        ...ctx,
        additional: { auditLogId: record.id },
      });

      console.log('Audit log recorded:', JSON.stringify(record, null, 2));

      return record;
    } catch (error) {
      this.logger.logError('Failed to record audit log', {
        ...ctx,
        additional: { error },
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }

      throw new InternalServerErrorException('Failed to record audit log');
    }
  }

  // ============================
  // CONTEXT GENERATION
  // ============================

  private buildContext<T>(input: {
    entityType: AuditEntity;
    action: AuditAction;
    oldRecord?: T | null;
    newRecord?: T | null;
  }): AuditContext {
    const event = resolveEvent(input);
    const changes = computeChanges<T>({
      oldRecord: input.oldRecord,
      newRecord: input.newRecord,
    });
    const related = buildRelated<T>({
      entityType: input.entityType,
      record: input.newRecord ?? input.oldRecord ?? null,
    });
    const context: AuditContext = {
      event: event,
      changes: changes,
      related: related,
      meta: {}, // TODO request metadata
    };

    return context;
  }

  // ============================
  // SUMMARY GENERATION
  // ============================

  private generateSummary(input: {
    entityType: AuditEntity;
    action: AuditAction;
    context: AuditContext;
  }): string {
    return `${input.entityType} ${input.action}`;
  }

  // ============================
  // DB PERSISTENCE
  // ============================

  private async persist(payload: AuditPayload): Promise<AuditLogRecord> {
    const record = await this.prisma.auditLog.create({
      data: {
        entityType: payload.entityType,
        entityId: payload.entityId,
        action: payload.action,
        actorUserId: payload.actorUserId ?? null,
        summary: payload.summary,
        context: payload.context as unknown as Prisma.InputJsonValue,
      },
    });

    return record as unknown as AuditLogRecord;
  }
}
