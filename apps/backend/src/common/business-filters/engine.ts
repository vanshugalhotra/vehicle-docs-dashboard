/**
 * BusinessFilterEngine
 *
 * Pure, synchronous engine that applies business-level filters
 * to an array of domain entities (e.g. vehicles).
 *
 * - Resolvers are pure functions (no DB access).
 * - Engine applies filters in AND order (each filter narrows the set).
 * - Deterministic and easy to unit-test.
 */

export type BusinessFilterValue = unknown;

/**
 * Predicate function for a single filter.
 * - `entity` is the domain object (e.g. vehicle returned from Prisma findMany)
 * - `value` is the value from parsed businessFilters (already validated by parser)
 *
 * Must be synchronous and deterministic (pure).
 */
export type BusinessPredicate<T = any> = (
  entity: T,
  value: BusinessFilterValue,
) => boolean;

/**
 * BusinessResolver maps a filter key to a predicate.
 * Additional metadata can be added later (e.g., description, deps).
 */
export interface BusinessResolver<T = any> {
  predicate: BusinessPredicate<T>;
  /** optional textual description for docs/tests */
  description?: string;
}

/**
 * Resolvers map: key -> resolver
 */
export type BusinessResolverMap<T = any> = Record<string, BusinessResolver<T>>;

export class BusinessFilterEngine<T = any> {
  constructor(private readonly resolvers: BusinessResolverMap<T> = {}) {}

  /**
   * Apply business filters to a list of entities.
   *
   * @param data - array of entities to filter (will not be mutated)
   * @param filters - parsed business filters object (key -> value)
   * @returns filtered array (new array)
   */
  apply(
    data: T[],
    filters: Record<string, BusinessFilterValue> | undefined,
  ): T[] {
    if (!filters || Object.keys(filters).length === 0) {
      // no business filters — return original array (shallow copy to avoid accidental mutation)
      return data.slice();
    }

    // Start from the original set and apply each filter in turn (AND semantics)
    let output: T[] = data.slice();

    for (const [key, value] of Object.entries(filters)) {
      // Skip undefined or null filter values (parser should prevent this, but be defensive)
      if (value === undefined || value === null) continue;

      const resolver = this.resolvers[key];
      if (!resolver) {
        // Unknown resolver: skip (parser should have rejected unknown keys)
        // We choose to skip here to be defensive; tests should ensure parser blocks unknown keys.
        continue;
      }

      const { predicate } = resolver;

      // Apply predicate and keep entities for which predicate returns truthy
      output = output.filter((entity) => {
        // Call predicate directly; let it throw if needed so errors surface to caller.
        return Boolean(predicate(entity, value));
      });

      // Short-circuit: if no items left, break early
      if (output.length === 0) break;
    }

    return output;
  }

  /**
   * Get list of registered keys (useful for validations/docs)
   */
  getRegisteredKeys(): string[] {
    return Object.keys(this.resolvers);
  }
}
