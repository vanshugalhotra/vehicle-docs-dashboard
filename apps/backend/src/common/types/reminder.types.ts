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
export interface GetQueueItemsOptions {
  status?: 'pending' | 'sent' | 'failed' | 'all';
  fromDate?: Date;
  toDate?: Date;
  configId?: string;
  includeFailed?: boolean;
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
