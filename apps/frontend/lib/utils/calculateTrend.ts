import { TrendPoint } from "@/lib/types/stats.types";

export type TrendPeriod = "day" | "week" | "month";

interface TrendResult {
  rate: number;
  label: string;
}

/**
 * Aggregate raw trend data based on period
 * and calculate rate vs previous period
 */
export function calculateTrendFromApi(
  apiTrend?: Array<{ date: string; count: number }>,
  period: TrendPeriod = "week"
): TrendResult | undefined {
  if (!apiTrend || apiTrend.length < 2) return undefined;

  // Convert to TrendPoint[]
  const normalized: TrendPoint[] = apiTrend.map((t) => ({
    date: t.date,
    label: t.date,
    value: t.count,
  }));

  const aggregated: Record<string, number> = {};

  normalized.forEach((point) => {
    if (!point.date) return;
    const d = new Date(point.date);
    let key: string;

    switch (period) {
      case "day":
        key = d.toISOString().split("T")[0]; // YYYY-MM-DD
        break;
      case "week": {
        const week = getWeekNumber(d);
        key = `${d.getFullYear()}-W${week}`;
        break;
      }
      case "month":
        key = `${d.getFullYear()}-${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
        break;
    }

    aggregated[key] = (aggregated[key] || 0) + point.value;
  });

  // Sort keys to find last two periods
  const keys = Object.keys(aggregated).sort();
  if (keys.length < 2) return undefined;

  const last = aggregated[keys[keys.length - 1]];
  const prev = aggregated[keys[keys.length - 2]];

  const rate = prev !== 0 ? Math.round(((last - prev) / prev) * 100) : 0;
  return { rate, label: `vs last ${period}` };
}

// Helper to get ISO week number
function getWeekNumber(d: Date) {
  const temp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = temp.getUTCDay() || 7;
  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  return Math.ceil(((+temp - +yearStart) / 86400000 + 1) / 7);
}
