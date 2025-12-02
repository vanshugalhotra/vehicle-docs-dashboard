import { Injectable } from '@nestjs/common';
import { ReminderRepository } from './reminder.repository';
import { SummaryEmailService } from 'src/email/summary-email.service';
import { LoggerService } from 'src/common/logger/logger.service';
import { SummaryQueueItem } from 'src/common/types/reminder.types';

@Injectable()
export class ReminderTriggerService {
  constructor(
    private readonly reminderRepo: ReminderRepository,
    private readonly summaryEmailService: SummaryEmailService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Process pending reminders and send summary email
   * @param triggeredBy Who initiated this run (e.g., "cron", "manual:admin", etc.)
   * @param preface Optional text for the email body
   */
  async processPendingReminders(
    triggeredBy: string,
    preface?: string,
  ): Promise<{ ok: boolean; message: string }> {
    this.logger.info(`Reminder processing triggered by: ${triggeredBy}`);

    let pendingItems: SummaryQueueItem[] = [];
    const failedItems: Array<{ id: string; error: string }> = [];

    try {
      // --------------------------------------------------------------
      // 1. Fetch pending queue items
      // --------------------------------------------------------------
      pendingItems = await this.reminderRepo.getQueueItems({
        status: 'pending',
        toDate: new Date(),
      });

      if (!pendingItems.length) {
        this.logger.info(
          `No pending queue items found. Triggered by: ${triggeredBy}`,
        );
        return { ok: true, message: 'No pending reminders to process.' };
      }

      this.logger.info(
        `${pendingItems.length} pending items found. Triggered by: ${triggeredBy}`,
      );

      // --------------------------------------------------------------
      // 2. Fetch active recipients
      // --------------------------------------------------------------
      const recipients = await this.reminderRepo.getActiveRecipients();

      if (!recipients.length) {
        this.logger.warn(`No active recipients. Triggered by: ${triggeredBy}`);

        // Mark all items as failed since no recipients
        for (const item of pendingItems) {
          try {
            await this.reminderRepo.markAsFailed(
              item.id,
              'No active recipients available',
            );
            failedItems.push({
              id: item.id,
              error: 'No active recipients available',
            });
          } catch (markError) {
            this.logger.error(
              `Failed to mark item ${item.id} as failed: ${markError}`,
              { itemId: item.id },
            );
          }
        }

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
      try {
        await this.summaryEmailService.sendSummaryEmailFromQueue(
          pendingItems,
          recipients,
          preface,
        );
      } catch (emailError) {
        const errorMessage =
          emailError instanceof Error
            ? emailError.message
            : 'Unknown email error';
        this.logger.error('Failed to send summary email', {
          error: errorMessage,
          triggeredBy,
        });

        // Mark all items as failed due to email error
        for (const item of pendingItems) {
          try {
            await this.reminderRepo.markAsFailed(
              item.id,
              `Email send failed: ${errorMessage.substring(0, 200)}`,
            );
            failedItems.push({
              id: item.id,
              error: errorMessage,
            });
          } catch (markError) {
            this.logger.error(
              `Failed to mark item ${item.id} as failed: ${markError}`,
              { itemId: item.id },
            );
          }
        }

        throw new Error(`Email sending failed: ${errorMessage}`);
      }

      // --------------------------------------------------------------
      // 4. Mark queue items as sent
      // --------------------------------------------------------------
      const sentItems: string[] = [];
      for (const item of pendingItems) {
        try {
          await this.reminderRepo.markAsSent(item.id);
          sentItems.push(item.id);
        } catch (markError) {
          const errorMessage =
            markError instanceof Error
              ? markError.message
              : 'Unknown marking error';
          this.logger.error(
            `Failed to mark item ${item.id} as sent: ${errorMessage}`,
            { itemId: item.id },
          );

          // Try to mark as failed instead
          try {
            await this.reminderRepo.markAsFailed(
              item.id,
              `Failed to mark as sent: ${errorMessage.substring(0, 200)}`,
            );
            failedItems.push({
              id: item.id,
              error: errorMessage,
            });
          } catch (failedMarkError) {
            this.logger.error(
              `Failed to mark item ${item.id} as failed after send error: ${failedMarkError}`,
              { itemId: item.id },
            );
          }
        }
      }

      // Log summary
      const successCount = sentItems.length;
      const failureCount = failedItems.length;

      this.logger.info(
        `Processed ${pendingItems.length} queue items. ` +
          `Success: ${successCount}, Failed: ${failureCount}. Triggered by: ${triggeredBy}`,
        {
          successCount,
          failureCount,
          failedItemIds: failedItems.map((f) => f.id),
        },
      );

      if (failureCount > 0) {
        return {
          ok: false,
          message: `Processed ${pendingItems.length} items with ${failureCount} failures. Check logs for details.`,
        };
      }

      return {
        ok: true,
        message: `Successfully processed and emailed ${successCount} queue items.`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to process pending reminders', {
        error: errorMessage,
        triggeredBy,
        pendingItemCount: pendingItems.length,
      });

      // If we have pending items but a general error occurred, mark them as failed
      if (pendingItems.length > 0) {
        this.logger.warn(
          `Attempting to mark ${pendingItems.length} items as failed due to general error`,
        );

        for (const item of pendingItems) {
          // Only mark items that haven't been processed yet
          if (!failedItems.some((f) => f.id === item.id)) {
            try {
              await this.reminderRepo.markAsFailed(
                item.id,
                `Processing failed: ${errorMessage.substring(0, 200)}`,
              );
            } catch (markError) {
              this.logger.error(
                `Failed to mark item ${item.id} as failed during error handling: ${markError}`,
                { itemId: item.id },
              );
            }
          }
        }
      }

      return {
        ok: false,
        message: `Failed to process reminders: ${errorMessage}`,
      };
    }
  }
}
