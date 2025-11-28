import { Injectable } from '@nestjs/common';
import { ReminderRepository } from './reminder.repository';
import { LoggerService } from 'src/common/logger/logger.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ReminderSchedulerService {
  constructor(
    private readonly repo: ReminderRepository,
    private readonly logger: LoggerService,
  ) {}

  // -------------------------------
  // EVENT HANDLERS
  // -------------------------------
  @OnEvent('vehicleDocument.created')
  async handleDocumentCreated(payload: { id: string; expiryDate: Date }) {
    await this.scheduleRemindersForDocument(payload.id, payload.expiryDate);
  }

  @OnEvent('vehicleDocument.updated')
  async handleDocumentUpdated(payload: { id: string; expiryDate: Date }) {
    await this.scheduleRemindersForDocument(payload.id, payload.expiryDate);
  }

  // -------------------------------
  // SINGLE DOCUMENT SCHEDULING
  // -------------------------------
  async scheduleRemindersForDocument(
    vehicleDocumentId: string,
    expiryDate: Date,
  ) {
    // Fetch all active reminder configs via repo
    const configs = await this.repo.getActiveConfigs();
    if (!configs.length) {
      this.logger.debug('No active ReminderConfigs, skipping scheduling');
      return;
    }

    for (const config of configs) {
      const scheduledAt = new Date(expiryDate);
      scheduledAt.setDate(scheduledAt.getDate() - config.offsetDays);

      if (scheduledAt < new Date()) {
        this.logger.debug(
          `Skipping past reminder: doc=${vehicleDocumentId}, config=${config.id}, scheduledAt=${String(scheduledAt)}`,
        );
        continue;
      }

      // Use repo to check duplicates
      const exists = await this.repo.existsQueueEntry(
        vehicleDocumentId,
        config.id,
        scheduledAt,
      );

      if (exists) {
        this.logger.debug(
          `Queue entry exists: doc=${vehicleDocumentId}, config=${config.id}, scheduledAt=${String(scheduledAt)}`,
        );
        continue;
      }

      // Use repo to create queue entry
      await this.repo.createQueueEntry({
        vehicleDocumentId,
        reminderConfigId: config.id,
        scheduledAt,
      });

      this.logger.info(
        `Scheduled reminder: doc=${vehicleDocumentId}, config=${config.id}, scheduledAt=${String(scheduledAt)}`,
      );
    }
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
    const documents = await this.repo.getAllDocuments();

    // Idempotent: repo handles duplicates internally
    await this.scheduleRemindersForDocuments(documents);
    this.logger.info('Rescheduling complete.');
  }
}
