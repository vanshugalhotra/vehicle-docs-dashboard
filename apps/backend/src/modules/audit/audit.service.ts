import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService, LogContext } from 'src/common/logger/logger.service';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { CurrentUserService } from 'src/common/current-user/current-user.service';

import {
  AuditAction,
  AuditEntity,
  AuditContext,
  AuditPayload,
  AuditLogRecord,
  AuditRecordParams,
} from 'src/common/types/audit.types';
import { computeChanges, buildRelated, buildSummaryAndEvent } from './helpers';

@Injectable()
export class AuditService {
  private readonly entity = 'Audit';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly currentUser: CurrentUserService,
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

    // Use debug for routine audit logging
    this.logger.logDebug('Recording audit log', ctx);

    try {
      // 1) Build structured context
      const context = this.buildContext<T>({
        entityType: params.entityType,
        action: params.action,
        oldRecord: params.oldRecord,
        newRecord: params.newRecord,
      });

      // 2) Build event + summary together
      const { summary, event } = this.generateSummaryAndEvent<T>({
        entityType: params.entityType,
        action: params.action,
        context,
        record: params.newRecord ?? params.oldRecord ?? null,
      });

      // write event back to context
      context.event = event;

      // 3) Determine actor user ID
      const actorUserId = params.actorUserId ?? this.currentUser.userId ?? null;

      // 4) Persist to DB
      const record = await this.persist({
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        vehicleId: params.vehicleId ?? null,
        actorUserId,
        summary,
        context,
      });

      // Debug is appropriate; info is optional since audit is routine
      this.logger.logDebug('Audit log written', {
        ...ctx,
        additional: { auditLogId: record.id },
      });

      return record;
    } catch (error) {
      this.logger.logError('Failed to record audit log', ctx, error);

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
    const event = ''; // placeholder
    const changes = computeChanges<T>({
      oldRecord: input.oldRecord,
      newRecord: input.newRecord,
    });
    const related = buildRelated<T>({
      entityType: input.entityType,
      record: input.newRecord ?? input.oldRecord ?? null,
    });

    const meta = {
      source: this.currentUser.email ?? 'SYSTEM',
    };

    return {
      event,
      changes,
      related,
      meta,
    };
  }

  // ============================
  // SUMMARY GENERATION
  // ============================
  private generateSummaryAndEvent<T>(input: {
    entityType: AuditEntity;
    action: AuditAction;
    context: AuditContext;
    record?: T | null;
  }): { summary: string; event: string } {
    return buildSummaryAndEvent<T>({
      entityType: input.entityType,
      action: input.action,
      context: input.context,
      record: input.record ?? null,
    });
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
        vehicleId: payload.vehicleId ?? null,
        summary: payload.summary,
        context: payload.context as unknown as Prisma.InputJsonValue,
      },
    });

    return record as unknown as AuditLogRecord;
  }
}
