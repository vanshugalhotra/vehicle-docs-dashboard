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
export interface SummaryQueueItem {
  id: string;
  configName: string;
  offsetDays: number;
  scheduledAt: Date;
  documentTypeName: string;
  documentNumber: string;
  expiryDate: Date;
  vehicleName: string;
}

export type SummaryEmailItem = Omit<SummaryQueueItem, 'configName'>;

export type SummaryEmailPayload = {
  configName: string;
  items: SummaryEmailItem[];
};
