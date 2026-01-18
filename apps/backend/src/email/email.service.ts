import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

import { LoggerService, LogContext } from 'src/common/logger/logger.service';
import { ConfigService } from 'src/config/config.service';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    const host = this.config.get('SMTP_HOST');
    const port = this.config.get('SMTP_PORT') ?? 587;
    const user = this.config.get('SMTP_USER');
    const pass = this.config.get('SMTP_PASS');
    const secure = port === 465;

    const transporterConfig: SMTPTransport.Options = {
      host,
      port,
      secure,
      auth: { user, pass },
    };

    this.transporter = nodemailer.createTransport(transporterConfig);

    const ctx: LogContext = {
      entity: 'EmailService',
      action: 'init',
      additional: { host, port, secure },
    };
    this.logger.logInfo('EmailService initialized', ctx);

    // --- Verify SMTP connection ---
    void this.verifyTransport();
  }

  private async verifyTransport() {
    try {
      await this.transporter.verify();
      this.logger.logInfo('SMTP connection verified successfully', {
        entity: 'EmailService',
        action: 'verifyTransport',
      });
    } catch (error: unknown) {
      this.logger.logError(
        'SMTP verification failed',
        {
          entity: 'EmailService',
          action: 'verifyTransport',
        },
        error,
      );
    }
  }

  async sendEmail(
    recipients: string[],
    subject: string,
    html: string,
  ): Promise<void> {
    const ctx: LogContext = {
      entity: 'EmailService',
      action: 'sendEmail',
      additional: { recipientsCount: recipients.length, subject },
    };

    if (!recipients.length) {
      this.logger.logWarn('No recipients provided. Skipping email send.', ctx);
      return;
    }

    const isProd = this.config.get('NODE_ENV') === 'production';

    if (!isProd) {
      this.saveHtmlToFile(html, subject);
      return;
    }

    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: `"YASH GROUP DASHBOARD" <${this.config.get('SMTP_USER')}>`,
        to: recipients.join(', '),
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      this.logger.logInfo('Email sent successfully', {
        ...ctx,
        additional: { ...ctx.additional, messageId: info.messageId },
      });
    } catch (error: unknown) {
      this.logger.logError('Failed to send email', ctx, error);
      throw error;
    }
  }

  private saveHtmlToFile(html: string, subject: string) {
    const ctx: LogContext = {
      entity: 'EmailService',
      action: 'saveHtmlToFile',
      additional: { subject },
    };

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `email_test_${timestamp}.html`;
      const filePath = path.join(process.cwd(), filename);

      fs.writeFileSync(filePath, html, 'utf-8');

      this.logger.logDebug('HTML saved to file (testing mode)', {
        ...ctx,
        additional: {
          filePath,
          fileSize: `${(html.length / 1024).toFixed(2)} KB`,
        },
      });
    } catch (error: unknown) {
      this.logger.logError('Failed to save HTML to file', ctx, error);
    }
  }
}
