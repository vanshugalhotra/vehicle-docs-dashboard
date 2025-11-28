import { ReminderConfig } from '@prisma/client';
import { VehicleDocumentResponse } from './vehicle-document.types';

export interface ReminderConfigResponse {
  id: string;
  name?: string;
  offsetDays: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReminderRecipientResponse {
  id: string;
  email: string;
  name?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Response type for listing ReminderQueue items
 */
export interface ReminderQueueResponse {
  id: string;
  scheduledAt: Date;
  sentAt?: Date | null;
  attempts: number;
  lastError?: string | null;
  vehicleDocumentId: string;
  reminderConfigId: string;
  vehicleDocument: VehicleDocumentResponse;
  reminderConfig: ReminderConfig;
}

/**
 * Payload format sent to the email service for a single reminder.
 */
export type ReminderEmailPayload = {
  configId: string;
  recipients: string[];
  document: {
    type: string;
    number: string;
    expiryDate: Date;
  };
  vehicle: {
    id: string;
    name: string;
    licensePlate: string;
  };
  scheduledAt: Date;
};
