import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { startOfDay, endOfDay, addDays } from 'src/common/utils/date-utils';

@Injectable()
export class ReminderRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------
  // Reminder Queue Operations
  // ---------------------------------------------------------

  /**
   * Create a queue entry.
   */
  async createQueueEntry(data: {
    vehicleDocumentId: string;
    reminderConfigId: string;
    scheduledAt: Date;
  }) {
    return this.prisma.reminderQueue.create({
      data,
    });
  }

  /**
   * Bulk insert (for daily scheduler).
   */
  async bulkInsertQueue(
    entries: {
      vehicleDocumentId: string;
      reminderConfigId: string;
      scheduledAt: Date;
    }[],
  ) {
    if (entries.length === 0) return;

    await this.prisma.reminderQueue.createMany({
      data: entries,
      skipDuplicates: true, // extra safety
    });
  }

  /**
   * Check if a specific queue item already exists (dedupe).
   * Avoids duplicates on same doc + config + day.
   */
  async existsQueueEntry(
    vehicleDocumentId: string,
    reminderConfigId: string,
    scheduledAt: Date,
  ): Promise<boolean> {
    const start = startOfDay(scheduledAt);
    const end = endOfDay(scheduledAt);

    const existing = await this.prisma.reminderQueue.findFirst({
      where: {
        vehicleDocumentId,
        reminderConfigId,
        scheduledAt: {
          gte: start,
          lte: end,
        },
      },
      select: { id: true },
    });

    return !!existing;
  }

  /**
   * Get all items scheduled up to now & not sent.
   */
  async getPendingToSend(now: Date) {
    return this.prisma.reminderQueue.findMany({
      where: {
        scheduledAt: { lte: now },
        sentAt: null,
      },
      orderBy: { scheduledAt: 'asc' },
      include: {
        vehicleDocument: {
          include: {
            documentType: true,
            vehicle: true,
          },
        },
        reminderConfig: true,
      },
    });
  }

  /**
   * Mark entry as sent.
   */
  async markAsSent(id: string) {
    return this.prisma.reminderQueue.update({
      where: { id },
      data: { sentAt: new Date(), attempts: { increment: 1 } },
    });
  }

  /**
   * Mark entry as failed.
   */
  async markAsFailed(id: string, error: string) {
    return this.prisma.reminderQueue.update({
      where: { id },
      data: {
        attempts: { increment: 1 },
        lastError: error,
      },
    });
  }

  /**
   * Get documents expiring in next X days.
   */
  async getDocumentsExpiringInDays(offset: number) {
    const today = startOfDay(new Date());
    const target = endOfDay(addDays(today, offset));

    return this.prisma.vehicleDocument.findMany({
      where: {
        expiryDate: {
          gte: today,
          lte: target,
        },
      },
      include: {
        documentType: true,
        vehicle: true,
      },
    });
  }

  /**
   * Clear old queue items (optional housekeeping).
   */
  async cleanupOldHistory(olderThanDays = 90) {
    const threshold = addDays(new Date(), -olderThanDays);

    return this.prisma.reminderQueue.deleteMany({
      where: {
        sentAt: { lte: threshold },
      },
    });
  }
}
