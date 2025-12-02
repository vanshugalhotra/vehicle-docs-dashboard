import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { LoggerService } from 'src/common/logger/logger.service';
import { ConfigService } from 'src/config/config.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.info(
      `EmailService initialized with SMTP host ${this.config.get('SMTP_HOST')}`,
    );
  }

  /**
   * Send email (or store HTML for debugging)
   */
  async sendEmail(
    recipients: string[],
    subject: string,
    html: string,
  ): Promise<void> {
    if (!recipients.length) {
      this.logger.warn('No recipients provided. Skipping email send.');
      return;
    }

    try {
      // ─────────────────────────────────────────────
      // DEBUG MODE → STORE HTML INTO FILE
      // ─────────────────────────────────────────────
      const debugDir = path.join(process.cwd(), 'email-debug');
      if (!fs.existsSync(debugDir)) {
        fs.mkdirSync(debugDir, { recursive: true });
      }

      const safeSubject = subject.replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `${safeSubject}_${Date.now()}.html`;
      const filePath = path.join(debugDir, fileName);

      fs.writeFileSync(filePath, html, 'utf8');

      this.logger.info(`Email HTML stored for debugging: ${filePath}`);

      // ─────────────────────────────────────────────
      // REAL SENDING (disabled for now)
      // ─────────────────────────────────────────────
      // await this.transporter.sendMail({
      //   from: `"YASH GROUP DASHBOARD" <${this.config.get('SMTP_USER')}>`,
      //   to: recipients.join(', '),
      //   subject,
      //   html,
      // });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to send email', { error: msg });
      throw error;
    }
  }
}
