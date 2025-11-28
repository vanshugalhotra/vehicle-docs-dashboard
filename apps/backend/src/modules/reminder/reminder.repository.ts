import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { startOfDay, endOfDay, addDays } from 'src/common/utils/date-utils';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import {
  ReminderQueue,
  VehicleDocument,
  Vehicle,
  DocumentType,
  ReminderConfig,
  ReminderRecipient,
} from '@prisma/client';
import { ReminderEmailPayload } from 'src/common/types/reminder.types';
import { LoggerService } from 'src/common/logger/logger.service';

@Injectable()
export class ReminderRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async getActiveConfigs(): Promise<ReminderConfig[]> {
    return this.prisma.reminderConfig.findMany({ where: { enabled: true } });
  }

  async getAllDocuments(): Promise<{ id: string; expiryDate: Date }[]> {
    return this.prisma.vehicleDocument.findMany({
      select: { id: true, expiryDate: true },
    });
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

  async bulkInsertQueue(
    entries: {
      vehicleDocumentId: string;
      reminderConfigId: string;
      scheduledAt: Date;
    }[],
  ): Promise<void> {
    if (!entries.length) return;
    this.logger.debug(`Bulk inserting ${entries.length} queue entries`);
    try {
      await this.prisma.reminderQueue.createMany({
        data: entries,
        skipDuplicates: true,
      });
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

  async getPendingToSend(now: Date = new Date()): Promise<
    (ReminderQueue & {
      vehicleDocument: VehicleDocument & {
        vehicle: Vehicle;
        documentType: DocumentType;
      };
      reminderConfig: ReminderConfig;
    })[]
  > {
    try {
      return await this.prisma.reminderQueue.findMany({
        where: { scheduledAt: { lte: now }, sentAt: null },
        orderBy: { scheduledAt: 'asc' },
        include: {
          vehicleDocument: { include: { vehicle: true, documentType: true } },
          reminderConfig: true,
        },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error fetching pending queue', {
        error: errorMessage,
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

  async getDocumentsExpiringInDays(
    offset: number,
  ): Promise<
    (VehicleDocument & { vehicle: Vehicle; documentType: DocumentType })[]
  > {
    const today = startOfDay(new Date());
    const target = endOfDay(addDays(today, offset));
    try {
      return await this.prisma.vehicleDocument.findMany({
        where: { expiryDate: { gte: today, lte: target } },
        include: { vehicle: true, documentType: true },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error fetching documents expiring in days', {
        error: errorMessage,
      });
      throw error;
    }
  }

  async cleanupOldHistory(days = 90): Promise<void> {
    const threshold = addDays(new Date(), -days);
    try {
      const deleted = await this.prisma.reminderQueue.deleteMany({
        where: { sentAt: { lte: threshold } },
      });
      this.logger.info(`Cleaned up ${deleted.count} old queue entries`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to cleanup old queue entries', {
        error: errorMessage,
      });
      throw error;
    }
  }

  // ---------------------------------------------------------
  // PAYLOAD BUILDER
  // ---------------------------------------------------------
  buildEmailPayload(
    entry: ReminderQueue & {
      vehicleDocument: VehicleDocument & {
        vehicle: Vehicle;
        documentType: DocumentType;
      };
      reminderConfig: ReminderConfig;
    },
    recipients: ReminderRecipient[],
  ): ReminderEmailPayload {
    const { vehicleDocument: doc, reminderConfig: config } = entry;
    return {
      configId: config.id,
      recipients: recipients.map((r) => r.email),
      document: {
        type: doc.documentType.name,
        number: doc.documentNo,
        expiryDate: doc.expiryDate,
      },
      vehicle: {
        id: doc.vehicle.id,
        name: doc.vehicle.name,
        licensePlate: doc.vehicle.licensePlate,
      },
      scheduledAt: entry.scheduledAt,
    };
  }
}
