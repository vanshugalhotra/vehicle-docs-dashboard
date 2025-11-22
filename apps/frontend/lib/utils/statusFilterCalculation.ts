// src/lib/utils/statusUtils.ts

export type DocumentStatus =
  | "all"
  | "expired"
  | "today"
  | "in_1_day"
  | "in_1_week"
  | "in_1_month"
  | "in_1_year";

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export function statusToExpiryFilter(status: DocumentStatus) {
  const now = new Date();

  switch (status) {
    case "expired":
      return { lte: now.toISOString() };

    case "today":
      return {
        gte: startOfDay(now).toISOString(),
        lte: endOfDay(now).toISOString(),
      };

    case "in_1_day": {
      const d = new Date(now);
      d.setDate(now.getDate() + 1);
      return {
        gte: now.toISOString(),
        lte: endOfDay(d).toISOString(),
      };
    }

    case "in_1_week": {
      const d = new Date(now);
      d.setDate(now.getDate() + 7);
      return {
        gte: now.toISOString(),
        lte: endOfDay(d).toISOString(),
      };
    }

    case "in_1_month": {
      const d = new Date(now);
      d.setMonth(now.getMonth() + 1);
      return {
        gte: now.toISOString(),
        lte: endOfDay(d).toISOString(),
      };
    }

    case "in_1_year": {
      const d = new Date(now);
      d.setFullYear(now.getFullYear() + 1);
      return {
        gte: now.toISOString(),
        lte: endOfDay(d).toISOString(),
      };
    }

    case "all":
    default:
      return undefined;
  }
}
