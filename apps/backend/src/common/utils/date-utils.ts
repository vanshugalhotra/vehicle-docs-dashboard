/**
 * All functions return new Date() instances to avoid mutation.
 */

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function endOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

export function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Compare two dates ignoring time.
 * Returns:
 *  -1 → A < B
 *   0 → A == B (same calendar day)
 *   1 → A > B
 */
export function compareDateOnly(a: Date, b: Date): number {
  const aMid = startOfDay(a).getTime();
  const bMid = startOfDay(b).getTime();

  if (aMid < bMid) return -1;
  if (aMid > bMid) return 1;
  return 0;
}

/**
 * Check if date falls on the same calendar day
 */
export function isSameDate(a: Date, b: Date): boolean {
  return compareDateOnly(a, b) === 0;
}

/**
 * Check if date falls between two dates (inclusive)
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const target = startOfDay(date).getTime();
  return (
    target >= startOfDay(start).getTime() && target <= endOfDay(end).getTime()
  );
}

export function calculateDaysRemaining(expiryDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);

  const diffMs = exp.getTime() - today.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return Math.ceil(diffDays);
}
