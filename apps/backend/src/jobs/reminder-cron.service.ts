// reminder-cron.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ReminderSchedulerService } from 'src/modules/reminder/reminder-scheduler.service';
import { ReminderTriggerService } from 'src/modules/reminder/reminder-trigger.service';
import { LoggerService } from 'src/common/logger/logger.service';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class ReminderCronService implements OnModuleInit {
  private readonly JOB_NAME = 'DAILY_REMINDER_JOB';

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly reminderSchedulingService: ReminderSchedulerService,
    private readonly reminderTriggerService: ReminderTriggerService,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    this.setupDailyJob();
  }

  private setupDailyJob() {
    const reminderTime = this.config.get('REMINDER_TIME') || '08:00';
    const timezone = this.config.get('TZ') || 'Asia/Kolkata';

    const cronExpression = this.parseTimeToCron(reminderTime);

    try {
      this.schedulerRegistry.deleteCronJob(this.JOB_NAME);
    } catch {
      // Job did not exist; no action needed
    }

    // Create the job
    const job = new CronJob(
      cronExpression,
      () => {
        this.executeDailyJob().catch((error) => {
          this.logger.error('Cron job execution failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        });
      },
      null,
      false,
      timezone,
    );
    this.schedulerRegistry.addCronJob(this.JOB_NAME, job);
    job.start();

    this.logger.info(
      `Daily reminder job scheduled for ${reminderTime} ${timezone}`,
    );
  }

  private async executeDailyJob() {
    this.logger.info('Starting daily reminder job...');

    try {
      // 1. First, reschedule all documents
      await this.reminderSchedulingService.rescheduleAllDocuments();

      // 2. Then, send the summary email
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const hour = today.getHours();
      let greeting = 'Good morning';
      if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
      if (hour >= 17) greeting = 'Good evening';

      const preface = `${greeting}!\n\nHere's your daily document expiry summary for ${formattedDate}.\n\nPlease review the documents below and take necessary action for any expiring or expired items.`;

      const result = await this.reminderTriggerService.processPendingReminders(
        'cron:daily',
        preface,
      );

      if (result.ok) {
        this.logger.info(
          `Daily reminder completed successfully: ${result.message}`,
        );
      } else {
        this.logger.warn(
          `Daily reminder completed with issues: ${result.message}`,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Daily reminder job failed: ${errorMessage}`);
    }
  }

  private parseTimeToCron(timeString: string): string {
    try {
      const [hours, minutes] = timeString.split(':').map(Number);

      // Validate time format
      if (
        isNaN(hours) ||
        isNaN(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
      ) {
        throw new Error(`Invalid time format: ${timeString}`);
      }

      return `${minutes} ${hours} * * *`;
    } catch {
      this.logger.warn(
        `Invalid REMINDER_TIME format: ${timeString}. Using default 08:00`,
      );
      return '0 8 * * *'; // Default: 8:00 AM
    }
  }
}
