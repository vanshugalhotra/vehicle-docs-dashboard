import { Module } from '@nestjs/common';
import { ReminderController } from './reminder.controller';
import { ReminderService } from './reminder.service';
import { ReminderRepository } from './reminder.repository';
import { ReminderSchedulerService } from './reminder-scheduler.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [ReminderController],
  providers: [ReminderService, ReminderRepository, ReminderSchedulerService],
  exports: [ReminderSchedulerService],
})
export class RemindersModule {}
