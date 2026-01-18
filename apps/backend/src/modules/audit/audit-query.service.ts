import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService, LogContext } from 'src/common/logger/logger.service';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';
import { Prisma } from '@prisma/client';
import { buildQueryArgs } from 'src/common/utils/query-builder';
import { PaginatedAuditLogResponseDto } from './dto/audit-response.dto';
import { AuditLogRecord } from 'src/common/types/audit.types';
import { mapAuditLogToDto } from './audit.mapper';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class AuditQueryService {
  private readonly entity = 'AuditLog';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Global audit log query engine.
   * Used for:
   *  - Global audit page
   *  - Entity-specific audit pages (via filters: entityType + entityId)
   */
  async listAuditLogs(
    query: QueryOptionsDto,
  ): Promise<PaginatedAuditLogResponseDto> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'fetch',
      additional: { query },
    };

    this.logger.logDebug('Fetching audit logs', ctx);

    try {
      /**
       * Build base Prisma args from unified query system
       * Searchable field = summary
       */
      const queryArgs = buildQueryArgs<
        AuditLogRecord,
        Prisma.AuditLogWhereInput
      >(query, ['summary']);

      const [logs, total] = await Promise.all([
        this.prisma.auditLog.findMany({
          where: queryArgs.where,
          skip: queryArgs.skip,
          take: queryArgs.take,
          orderBy: queryArgs.orderBy,
        }),
        this.prisma.auditLog.count({
          where: queryArgs.where,
        }),
      ]);

      this.logger.logInfo('Fetched audit logs', {
        ...ctx,
        additional: { fetched: logs.length, total },
      });

      return {
        items: logs.map(mapAuditLogToDto),
        total,
      };
    } catch (error) {
      this.logger.logError('Failed to fetch audit logs', {
        ...ctx,
        additional: { error },
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }

      throw error;
    }
  }

  // ────────────────────────────────────────────────
  // READ ONE
  // ────────────────────────────────────────────────
  async getAuditLogById(id: string) {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'fetch_one',
      additional: { id },
    };

    this.logger.logDebug('Fetching audit log by id', ctx);

    try {
      const log = await this.prisma.auditLog.findUnique({
        where: { id },
      });

      if (!log) {
        throw new NotFoundException(`Audit log ${id} not found`);
      }

      this.logger.logInfo('Fetched audit log', ctx);

      return mapAuditLogToDto(log);
    } catch (error) {
      this.logger.logError('Failed to fetch audit log', {
        ...ctx,
        additional: { error },
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }

      throw error;
    }
  }
}
