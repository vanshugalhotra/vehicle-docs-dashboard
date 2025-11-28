import { PartialType } from '@nestjs/swagger';
import { CreateReminderConfigDto } from './create-reminder.dto';

export class UpdateReminderConfigDto extends PartialType(
  CreateReminderConfigDto,
) {}

import { CreateReminderRecipientDto } from './create-reminder.dto';

export class UpdateReminderRecipientDto extends PartialType(
  CreateReminderRecipientDto,
) {}
