import { ApiProperty } from '@nestjs/swagger';
import {
  ReminderConfigResponse,
  ReminderRecipientResponse,
  SummaryQueueItem,
} from 'src/common/types/reminder.types';

export class ReminderConfigResponseDto implements ReminderConfigResponse {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty()
  offsetDays: number;

  @ApiProperty()
  enabled: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ReminderRecipientResponseDto implements ReminderRecipientResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ReminderQueueResponseDto implements SummaryQueueItem {
  @ApiProperty()
  id: string;
  @ApiProperty()
  configName: string;
  @ApiProperty()
  offsetDays: number;
  @ApiProperty()
  scheduledAt: Date;
  @ApiProperty()
  documentTypeName: string;
  @ApiProperty()
  documentNumber: string;
  @ApiProperty()
  expiryDate: Date;
  @ApiProperty()
  vehicleName: string;
}
