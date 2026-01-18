import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/common/logger/logger.service';
import { EmailService } from './email.service';
import { ConfigService } from 'src/config/config.service';
import {
  SummaryQueueItem,
  SummaryEmailPayload,
} from 'src/common/types/reminder.types';
import { buildSummaryEmailPayload } from 'src/modules/reminder/payload-builder';
import { renderSummaryEmailHtml } from './templates/summary-email.template';

@Injectable()
export class SummaryEmailService {
  constructor(
    private readonly emailService: EmailService,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Build summary email HTML from queue items and send it to recipients
   * @param items queue items to summarize
   * @param recipients array of email addresses
   * @param preface optional preface text for the email
   */
  async sendSummaryEmailFromQueue(
    items: SummaryQueueItem[],
    recipients: string[],
    preface?: string,
  ): Promise<void> {
    if (!items.length) {
      this.logger.info('No queue items to process for summary email.');
      return;
    }

    if (!recipients.length) {
      this.logger.warn('No recipients provided for summary email.');
      return;
    }

    this.logger.info(
      `Building summary email for ${items.length} queue items to send to ${recipients.length} recipients`,
    );

    try {
      // Build summary payload
      const payload: SummaryEmailPayload[] = buildSummaryEmailPayload(items);

      // Render HTML using template
      const frontendUrl = this.config.get('FRONTEND_URL') || 'localhost:3000';
      const html: string = renderSummaryEmailHtml(payload, {
        preface,
        dashboardUrl: frontendUrl,
      });

      // Send email via EmailService
      await this.emailService.sendEmail(
        recipients,
        'Vehicle Expiration Summary',
        html,
      );

      this.logger.info(
        `Summary email successfully sent to ${recipients.join(', ')}`,
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to send summary email', { error: msg });
      throw error;
    }
  }
}
