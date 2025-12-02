import { Module } from '@nestjs/common';
import { ReminderController } from './reminder.controller';
import { ReminderService } from './reminder.service';
import { ReminderRepository } from './reminder.repository';
import { ReminderSchedulerService } from './reminder-scheduler.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ReminderTriggerService } from './reminder-trigger.service';
import { SummaryEmailService } from 'src/email/summary-email.service';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [ReminderController],
  providers: [
    ReminderService,
    ReminderRepository,
    ReminderSchedulerService,
    ReminderTriggerService,
    SummaryEmailService,
    EmailService,
  ],
  exports: [ReminderSchedulerService],
})
export class RemindersModule {}
