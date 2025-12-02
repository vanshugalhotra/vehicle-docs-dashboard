import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { startOfDay, endOfDay } from 'src/common/utils/date-utils';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { ReminderQueue, ReminderConfig } from '@prisma/client';
import { LoggerService } from 'src/common/logger/logger.service';
import {
  SummaryQueueItem,
  GetQueueItemsOptions,
} from 'src/common/types/reminder.types';

@Injectable()
export class ReminderRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async getActiveConfigs(): Promise<ReminderConfig[]> {
    return this.prisma.reminderConfig.findMany({ where: { enabled: true } });
  }

  async getActiveRecipients(): Promise<string[]> {
    try {
      const rows = await this.prisma.reminderRecipient.findMany({
        where: { active: true },
        select: { email: true },
      });

      return rows.map((r) => r.email);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error('Failed to fetch active reminder recipients', {
        error: errorMessage,
      });

      throw error;
    }
  }

  async getAllDocuments(): Promise<{ id: string; expiryDate: Date }[]> {
    return this.prisma.vehicleDocument.findMany({
      select: { id: true, expiryDate: true },
    });
  }

  async clearQueue(): Promise<void> {
    await this.prisma.reminderQueue.deleteMany({});
    this.logger.warn('ReminderQueue cleared - full rebuild required.');
  }

  // ---------------------------------------------------------
  // QUEUE OPERATIONS
  // ---------------------------------------------------------

  async createQueueEntry(data: {
    vehicleDocumentId: string;
    reminderConfigId: string;
    scheduledAt: Date;
  }): Promise<ReminderQueue> {
    this.logger.debug(
      `Creating queue entry: doc=${data.vehicleDocumentId}, config=${data.reminderConfigId}, scheduledAt=${String(data.scheduledAt)}`,
    );
    try {
      return await this.prisma.reminderQueue.create({ data });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, 'ReminderQueue');
      }
      throw error;
    }
  }

  async existsQueueEntry(
    vehicleDocumentId: string,
    reminderConfigId: string,
    scheduledAt: Date,
  ): Promise<boolean> {
    try {
      const start = startOfDay(scheduledAt);
      const end = endOfDay(scheduledAt);

      const existing = await this.prisma.reminderQueue.findFirst({
        where: {
          vehicleDocumentId,
          reminderConfigId,
          scheduledAt: { gte: start, lte: end },
        },
        select: { id: true },
      });

      return !!existing;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error message', { error: errorMessage });
      throw error;
    }
  }

  async getQueueItems(
    options: GetQueueItemsOptions = {},
  ): Promise<SummaryQueueItem[]> {
    try {
      const {
        status = 'pending',
        fromDate,
        toDate,
        configId,
        includeFailed = false,
      } = options;

      // Build where clause
      const whereClause: Prisma.ReminderQueueWhereInput = {};

      // Status filter
      if (status === 'pending') {
        whereClause.sentAt = null;
        whereClause.lastError = null;
      } else if (status === 'sent') {
        whereClause.sentAt = { not: null };
        whereClause.lastError = null;
      } else if (status === 'failed') {
        whereClause.OR = [
          { lastError: { not: null } },
          { attempts: { gte: 3 } },
        ];
      } else if (status === 'all') {
        if (!includeFailed) {
          whereClause.lastError = null;
        }
      }

      // Date range filter
      if (fromDate || toDate) {
        whereClause.scheduledAt = {};
        if (fromDate) {
          whereClause.scheduledAt.gte = fromDate;
        }
        if (toDate) {
          whereClause.scheduledAt.lte = toDate;
        }
      }

      // Config ID filter
      if (configId) {
        whereClause.reminderConfigId = configId;
      }

      const rows = await this.prisma.reminderQueue.findMany({
        where: whereClause,
        orderBy: { scheduledAt: 'asc' },
        include: {
          reminderConfig: {
            select: { name: true, offsetDays: true },
          },
          vehicleDocument: {
            select: {
              documentNo: true,
              expiryDate: true,
              documentType: {
                select: { name: true },
              },
              vehicle: {
                select: { name: true },
              },
            },
          },
        },
      });

      return rows.map((entry) => ({
        id: entry.id,
        configName: entry.reminderConfig.name ?? 'Others',
        offsetDays: entry.reminderConfig.offsetDays,
        scheduledAt: entry.scheduledAt,
        documentTypeName: entry.vehicleDocument.documentType.name,
        documentNumber: entry.vehicleDocument.documentNo,
        expiryDate: entry.vehicleDocument.expiryDate,
        vehicleName: entry.vehicleDocument.vehicle.name,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error fetching queue items', {
        error: errorMessage,
        options,
      });
      throw error;
    }
  }

  async markAsSent(id: string): Promise<void> {
    try {
      await this.prisma.reminderQueue.update({
        where: { id },
        data: { sentAt: new Date(), attempts: { increment: 1 } },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to mark queue ${id} as sent`, {
        error: errorMessage,
      });

      throw error;
    }
  }

  async markAsFailed(id: string, errorMsg: string): Promise<void> {
    try {
      await this.prisma.reminderQueue.update({
        where: { id },
        data: { attempts: { increment: 1 }, lastError: errorMsg },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to mark queue ${id} as failed`, {
        error: errorMessage,
      });
      throw error;
    }
  }
}
