import type { FiltersObject} from "@/lib/types/filter.types";

/**
 * Clean filter values by removing undefined/null/empty strings and empty arrays.
 */
export function cleanFilters(filters?: FiltersObject | null): FiltersObject {
  if (!filters) return {};
  const cleaned: FiltersObject = {};
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    cleaned[k] = v;
  }
  return cleaned;
}

/**
 * Serialize filters to JSON string for backend `filters` param.
 * Backend expects plain JSON (not URL encoded) per your example.
 */
export function serializeFilters(filters?: FiltersObject | null): string {
  const cleaned = cleanFilters(filters);
  try {
    return JSON.stringify(cleaned);
  } catch (err) {
    console.warn("[serializeFilters] failed", err);
    return "";
  }
}

/**
 * Merge two filter objects (next overrides base). Empty values removed.
 */
export function mergeFilters(base: FiltersObject = {}, next: FiltersObject = {}): FiltersObject {
  return cleanFilters({ ...base, ...next });
}
