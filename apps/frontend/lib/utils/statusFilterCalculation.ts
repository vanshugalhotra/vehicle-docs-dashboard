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
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const dayAfterTomorrow = new Date(now);
      dayAfterTomorrow.setDate(now.getDate() + 2);
      return {
        gte: startOfDay(tomorrow).toISOString(),
        lte: endOfDay(tomorrow).toISOString(),
      };
    }

    case "in_1_week": {
      const dayAfterTomorrow = new Date(now);
      dayAfterTomorrow.setDate(now.getDate() + 2);
      const oneWeekFromNow = new Date(now);
      oneWeekFromNow.setDate(now.getDate() + 7);
      return {
        gte: startOfDay(dayAfterTomorrow).toISOString(),
        lte: endOfDay(oneWeekFromNow).toISOString(),
      };
    }

    case "in_1_month": {
      const oneWeekFromNow = new Date(now);
      oneWeekFromNow.setDate(now.getDate() + 8); // Start from day after 1 week
      const oneMonthFromNow = new Date(now);
      oneMonthFromNow.setMonth(now.getMonth() + 1);
      return {
        gte: startOfDay(oneWeekFromNow).toISOString(),
        lte: endOfDay(oneMonthFromNow).toISOString(),
      };
    }

    case "in_1_year": {
      const oneMonthFromNow = new Date(now);
      oneMonthFromNow.setMonth(now.getMonth() + 2); // Start from day after 1 month
      const oneYearFromNow = new Date(now);
      oneYearFromNow.setFullYear(now.getFullYear() + 1);
      return {
        gte: startOfDay(oneMonthFromNow).toISOString(),
        lte: endOfDay(oneYearFromNow).toISOString(),
      };
    }

    case "all":
    default:
      return undefined;
  }
}