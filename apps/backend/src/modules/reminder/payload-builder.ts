import {
  SummaryQueueItem,
  SummaryEmailPayload,
} from 'src/common/types/reminder.types';

export function buildSummaryEmailPayload(
  items: SummaryQueueItem[],
): SummaryEmailPayload[] {
  if (!items.length) return [];

  const groups: Record<string, SummaryQueueItem[]> = {};

  // group by configName
  for (const item of items) {
    if (!groups[item.configName]) groups[item.configName] = [];
    groups[item.configName].push(item);
  }

  // convert each group into a summary payload
  return Object.keys(groups).map((configName) => ({
    configName,
    items: groups[configName].map((entry) => ({
      id: entry.id,
      offsetDays: entry.offsetDays,
      scheduledAt: entry.scheduledAt,
      documentTypeName: entry.documentTypeName,
      documentNumber: entry.documentNumber,
      expiryDate: entry.expiryDate,
      vehicleName: entry.vehicleName,
    })),
  }));
}
