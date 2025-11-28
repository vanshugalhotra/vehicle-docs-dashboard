import { ApiProperty } from '@nestjs/swagger';
import { ReminderConfig } from '@prisma/client';
import { VehicleDocumentResponse } from 'src/common/types';
import {
  ReminderConfigResponse,
  ReminderQueueResponse,
  ReminderRecipientResponse,
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

export class ReminderQueueResponseDto implements ReminderQueueResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  scheduledAt: Date;

  @ApiProperty({ required: false })
  sentAt?: Date | null;

  @ApiProperty()
  attempts: number;

  @ApiProperty({ required: false })
  lastError?: string | null;

  @ApiProperty()
  vehicleDocumentId: string;

  @ApiProperty()
  reminderConfigId: string;

  @ApiProperty()
  vehicleDocument: VehicleDocumentResponse;

  @ApiProperty()
  reminderConfig: ReminderConfig;
}
