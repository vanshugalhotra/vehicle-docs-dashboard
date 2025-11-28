import { Module } from '@nestjs/common';
import { ReminderController } from './reminder.controller';
import { ReminderService } from './reminder.service';
import { ReminderRepository } from './reminder.repository';

@Module({
  controllers: [ReminderController],
  providers: [ReminderService, ReminderRepository],
})
export class RemindersModule {}
