import { Injectable } from '@nestjs/common';
import { ReminderRepository } from './reminder.repository';
import { SummaryEmailService } from 'src/email/summary-email.service';
import { LoggerService } from 'src/common/logger/logger.service';

@Injectable()
export class ReminderTriggerService {
  constructor(
    private readonly reminderRepo: ReminderRepository,
    private readonly summaryEmailService: SummaryEmailService,
    private readonly logger: LoggerService,
  ) {}

  /**
   *
   * @param triggeredBy Who initiated this run (e.g., "cron", "manual:admin", etc.)
   * @param preface Optional text for the email body
   */
  async processPendingReminders(
    triggeredBy: string,
    preface?: string,
  ): Promise<{ ok: boolean; message: string }> {
    this.logger.info(`Reminder processing triggered by: ${triggeredBy}`);

    // --------------------------------------------------------------
    // 1. Fetch pending queue items
    // --------------------------------------------------------------
    const pendingItems = await this.reminderRepo.getQueueItems({
      status: 'pending',
      toDate: new Date(),
    });

    if (!pendingItems.length) {
      this.logger.info(
        `No pending queue items found. Triggered by: ${triggeredBy}`,
      );
      return { ok: true, message: 'No pending reminders to process.' };
    }

    this.logger.debug(
      `${pendingItems.length} pending items found. Triggered by: ${triggeredBy}`,
    );

    // --------------------------------------------------------------
    // 2. Fetch active recipients
    // --------------------------------------------------------------
    const recipients = await this.reminderRepo.getActiveRecipients();

    if (!recipients.length) {
      this.logger.warn(`No active recipients. Triggered by: ${triggeredBy}`);
      return {
        ok: false,
        message: 'No active recipients found. Cannot send summary email.',
      };
    }

    this.logger.debug(
      `Recipients (${recipients.length}): ${recipients.join(', ')}`,
    );

    // --------------------------------------------------------------
    // 3. Build summary email + send it
    // --------------------------------------------------------------
    await this.summaryEmailService.sendSummaryEmailFromQueue(
      pendingItems,
      recipients,
      preface,
    );

    // --------------------------------------------------------------
    // 4. Mark queue items as sent
    // --------------------------------------------------------------
    for (const item of pendingItems) {
      await this.reminderRepo.markAsSent(item.id);
    }

    this.logger.info(
      `Processed ${pendingItems.length} queue items. Triggered by: ${triggeredBy}`,
    );

    return {
      ok: true,
      message: `Processed and emailed ${pendingItems.length} queue items.`,
    };
  }
}
