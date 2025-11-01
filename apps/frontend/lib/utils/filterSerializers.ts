import type { FiltersObject, FilterValue } from "@/lib/types/filter.types";

/**
 * Safely serializes filters object → backend string.
 * - Removes undefined, null, and empty string values
 * - URL-encodes JSON for safe transport in query params
 */
export function serializeFilters(
  filters: FiltersObject | undefined | null
): string {
  if (!filters || typeof filters !== "object") return "";

  // Clean up empty values
  const cleaned: Record<string, FilterValue> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      continue;
    }
    cleaned[key] = value;
  }

  try {
    const json = JSON.stringify(cleaned);
    return encodeURIComponent(json);
  } catch (err) {
    console.warn("[serializeFilters] Failed to serialize filters:", err);
    return "";
  }
}

/**
 * Deserializes backend filters string → object form.
 * - Handles URL decoding
 * - Gracefully recovers from invalid input
 */
export function deserializeFilters(encoded?: string): FiltersObject {
  if (!encoded) return {};
  try {
    const decoded = decodeURIComponent(encoded);
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed === "object") {
      return parsed as FiltersObject;
    }
    return {};
  } catch (err) {
    console.warn("[deserializeFilters] Invalid filters string:", encoded, err);
    return {};
  }
}

/**
 * Utility to merge new filters into an existing object
 * Removes empty values automatically
 */
export function mergeFilters(
  base: FiltersObject,
  next: FiltersObject
): FiltersObject {
  const merged = { ...base, ...next };
  const cleaned: FiltersObject = {};
  for (const [key, value] of Object.entries(merged)) {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    )
      continue;
    cleaned[key] = value;
  }
  return cleaned;
}

/**
 * Converts a backend query param string to a human-readable debug form.
 * Useful for logging or inspecting outgoing requests.
 */
export function prettyPrintFilters(encoded?: string): string {
  const obj = deserializeFilters(encoded);
  return JSON.stringify(obj, null, 2);
}
