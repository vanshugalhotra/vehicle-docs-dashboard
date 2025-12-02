import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

import { LoggerService } from 'src/common/logger/logger.service';
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
      auth: {
        user,
        pass,
      },
    };

    this.transporter = nodemailer.createTransport(transporterConfig);

    this.logger.info(
      `EmailService initialized with SMTP host ${host}:${port} (secure: ${secure})`,
    );
  }

  async sendEmail(
    recipients: string[],
    subject: string,
    html: string,
  ): Promise<void> {
    if (!recipients.length) {
      this.logger.warn('No recipients provided. Skipping email send.');
      return;
    }

    // Check if we're in testing environment
    const isTesting = this.config.get('NODE_ENV') === 'test';

    if (isTesting) {
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

      this.logger.info('Email sent successfully', {
        messageId: info.messageId,
        recipientsCount: recipients.length,
        subject,
      });
    } catch (error: unknown) {
      // FIX: safe narrowing
      const msg = error instanceof Error ? error.message : 'Unknown error';

      this.logger.error('Failed to send email', {
        error: msg,
        recipientsCount: recipients.length,
        subject,
      });

      throw error;
    }
  }

  private saveHtmlToFile(html: string, subject: string) {
    try {
      const filename = `linkage_test.html`;

      const saveDir = process.cwd();
      const filePath = path.join(saveDir, filename);

      fs.writeFileSync(filePath, html, 'utf-8');

      this.logger.info('HTML saved to file (testing mode)', {
        filePath,
        subject,
        fileSize: `${(html.length / 1024).toFixed(2)} KB`,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to save HTML to file', {
        error: msg,
        subject,
      });
    }
  }
}
