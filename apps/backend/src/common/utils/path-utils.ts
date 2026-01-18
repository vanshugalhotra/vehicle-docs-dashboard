/**
 * Safely read a value from an object using dotted path notation.
 *
 * Examples:
 *  getByPath(obj, "name")
 *  getByPath(obj, "vehicle.name")
 *  getByPath(obj, "vehicle.owner.name")
 */
export function getByPath(obj: unknown, path: string | undefined): unknown {
  if (!obj || !path) return undefined;

  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined || typeof acc !== 'object') {
      return undefined;
    }

    return (acc as Record<string, unknown>)[key];
  }, obj);
}
