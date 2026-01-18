import { Injectable } from '@nestjs/common';
import { ReminderRepository } from './reminder.repository';
import { LoggerService } from 'src/common/logger/logger.service';
// import { OnEvent } from '@nestjs/event-emitter'; // Commented out
import {
  startOfDay,
  calculateDaysRemaining,
} from 'src/common/utils/date-utils';

@Injectable()
export class ReminderSchedulerService {
  constructor(
    private readonly repo: ReminderRepository,
    private readonly logger: LoggerService,
  ) {}

  // -------------------------------
  // EVENT HANDLERS (COMMENTED OUT - NOT USED CURRENTLY)
  // -------------------------------

  // @OnEvent('vehicleDocument.created')
  // async handleDocumentCreated(payload: { id: string; expiryDate: Date }) {
  //   await this.scheduleRemindersForDocument(payload.id, payload.expiryDate);
  // }

  // @OnEvent('vehicleDocument.updated')
  // async handleDocumentUpdated(payload: { id: string; expiryDate: Date }) {
  //   await this.scheduleRemindersForDocument(payload.id, payload.expiryDate);
  // }

  async scheduleRemindersForDocument(
    vehicleDocumentId: string,
    expiryDate: Date,
  ) {
    const configs = await this.repo.getActiveConfigs();
    if (!configs.length) {
      this.logger.error('No active ReminderConfigs.');
      return;
    }

    const today = startOfDay(new Date());
    const remainingDays = calculateDaysRemaining(expiryDate);

    // ------------------------------
    // EXPIRED DOCUMENTS (remainingDays < 0)
    // ------------------------------
    if (remainingDays < 0) {
      const zeroConfig = configs.find((c) => c.offsetDays === 0);

      if (!zeroConfig) {
        this.logger.debug(
          `Expired doc=${vehicleDocumentId} but no 0-day config exists. Skipping.`,
        );
        return;
      }

      const scheduledAt = today;

      const exists = await this.repo.existsQueueEntry(
        vehicleDocumentId,
        zeroConfig.id,
        scheduledAt,
      );

      if (exists) {
        this.logger.debug(
          `Expired-doc reminder already exists for doc=${vehicleDocumentId}`,
        );
        return;
      }

      await this.repo.createQueueEntry({
        vehicleDocumentId,
        reminderConfigId: zeroConfig.id,
        scheduledAt,
      });

      this.logger.info(
        `Scheduled EXPIRED reminder: doc=${vehicleDocumentId}, config=${zeroConfig.id}, scheduledAt=${scheduledAt.toISOString()}`,
      );

      return;
    }

    // ------------------------------
    // NON-EXPIRED DOCUMENTS (remainingDays >= 0)
    // ------------------------------

    const sorted = configs.sort((a, b) => a.offsetDays - b.offsetDays);

    const chosen = sorted.find((c) => remainingDays <= c.offsetDays);

    if (!chosen) {
      this.logger.debug(
        `No matching bucket for remaining=${remainingDays}, doc=${vehicleDocumentId}`,
      );
      return;
    }

    let scheduledAt = new Date(expiryDate);
    scheduledAt.setDate(scheduledAt.getDate() - chosen.offsetDays);

    // Normalize for safety
    const scheduledDay = startOfDay(scheduledAt);

    if (scheduledDay < today) {
      scheduledAt = today;
    }

    const exists = await this.repo.existsQueueEntry(
      vehicleDocumentId,
      chosen.id,
      scheduledAt,
    );

    if (exists) {
      this.logger.debug(
        `Bucket reminder already exists for doc=${vehicleDocumentId}, config=${chosen.id}`,
      );
      return;
    }

    await this.repo.createQueueEntry({
      vehicleDocumentId,
      reminderConfigId: chosen.id,
      scheduledAt,
    });

    this.logger.info(
      `Scheduled bucket reminder: doc=${vehicleDocumentId}, config=${chosen.id}, scheduledAt=${scheduledAt.toISOString()}`,
    );
  }

  // -------------------------------
  // BULK DOCUMENT SCHEDULING
  // -------------------------------
  async scheduleRemindersForDocuments(
    documents: { id: string; expiryDate: Date }[],
  ) {
    for (const doc of documents) {
      try {
        await this.scheduleRemindersForDocument(doc.id, doc.expiryDate);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        this.logger.error(`Failed to schedule for doc=${doc.id}`, {
          error: errorMessage,
        });
      }
    }
  }

  // -------------------------------
  // FULL RESCHEDULE (MANUAL)
  // -------------------------------
  async rescheduleAllDocuments() {
    this.logger.info('Rescheduling reminders for all VehicleDocuments...');

    await this.repo.clearQueue(); // clear the queue

    const documents = await this.repo.getAllDocuments();

    // Idempotent: repo handles duplicates internally
    await this.scheduleRemindersForDocuments(documents);
    this.logger.info('Rescheduling complete.');
  }
}
