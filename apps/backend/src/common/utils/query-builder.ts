import { QueryOptionsDto } from '../dto/query-options.dto';

/**
 * Generic Prisma query builder that supports:
 * - Pagination (`skip`, `take`)
 * - Search across multiple fields (`searchableFields`)
 * - Sorting (`sortBy`, `order`)
 * - Dynamic filters (`filters`)
 * - Range operators (`gte`, `lte`, `gt`, `lt`, `not`)
 */
export function buildQueryArgs<
  T extends Record<string, any>,
  WhereInput extends Record<string, unknown> = Record<string, unknown>,
>(
  dto: QueryOptionsDto,
  searchableFields: (keyof T)[] = [],
): {
  skip: number;
  take: number;
  where?: WhereInput;
  orderBy: Record<string, 'asc' | 'desc'>;
} {
  const skip = Number(dto.skip ?? 0);
  const take = Number(dto.take ?? 20);
  const sortBy: string = dto.sortBy || 'createdAt';
  const order: 'asc' | 'desc' = dto.order || 'desc';
  const search = dto.search?.trim();

  // --- Safe parse for filters ---
  let filters: Record<string, unknown> = {};
  if (dto.filters) {
    try {
      const parsed: unknown =
        typeof dto.filters === 'string' ? JSON.parse(dto.filters) : dto.filters;
      if (parsed && typeof parsed === 'object') {
        filters = parsed as Record<string, unknown>;
      }
    } catch (error) {
      console.warn('Invalid filters JSON:', dto.filters, error);
    }
  }

  const where: Record<string, unknown> = {};

  // --- Search across multiple fields (case-insensitive) ---
  if (search && searchableFields.length > 0) {
    where.OR = searchableFields.map((field) => ({
      [field]: { contains: search, mode: 'insensitive' },
    }));
  }

  // --- Helper to normalize values ---
  const normalizeValue = (val: unknown): unknown => {
    if (typeof val === 'string') {
      const lower = val.trim().toLowerCase();

      // Boolean normalization
      if (lower === 'true') return true;
      if (lower === 'false') return false;

      // Date string detection and conversion
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        // Convert "YYYY-MM-DD" to ISO DateTime with timezone
        return new Date(val + 'T00:00:00.000Z').toISOString();
      }

      // ISO DateTime string validation
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
        const date = new Date(val);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      }
    }
    return val;
  };

  // --- Apply filters ---
  for (const [key, rawValue] of Object.entries(filters)) {
    if (rawValue === undefined || rawValue === null || rawValue === '')
      continue;

    const value = normalizeValue(rawValue);

    // Support keys like expiryDate_gte: '2025-01-01'
    const rangeMatch = key.match(/^(.+)_(gte|lte|gt|lt|not)$/);
    if (rangeMatch) {
      const [, field, op] = rangeMatch;
      const currentField = where[field] as Record<string, unknown> | undefined;
      where[field] = { ...currentField, [op]: value };
      continue;
    }

    // Handle range/comparison object { expiryDate: { gte: '2025-01-01', lte: '2025-12-31' } }
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const validOps = ['gte', 'lte', 'gt', 'lt', 'not', 'equals', 'in'];
      const keys = Object.keys(value);
      const isOperatorObject = keys.every((k) => validOps.includes(k));

      if (isOperatorObject) {
        // Normalize date values in range objects too
        const normalizedRange: Record<string, unknown> = {};
        for (const [opKey, opValue] of Object.entries(value)) {
          normalizedRange[opKey] = normalizeValue(opValue);
        }
        where[key] = normalizedRange;
        continue;
      }
    }

    // Handle arrays -> `in` operator
    if (Array.isArray(value)) {
      where[key] = { in: value };
      continue;
    }

    // Default exact match
    where[key] = value;
  }

  const finalWhere =
    Object.keys(where).length > 0 ? (where as WhereInput) : undefined;

  return {
    skip,
    take,
    where: finalWhere,
    orderBy: { [sortBy]: order },
  };
}

/**
 * Helper function to convert date strings to DateTime for Prisma
 * This can be used independently if needed
 */
export function normalizeDateForPrisma(dateString: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    // Convert "YYYY-MM-DD" to ISO DateTime
    return new Date(dateString + 'T00:00:00.000Z').toISOString();
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateString)) {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  throw new Error(
    `Invalid date format: ${dateString}. Expected YYYY-MM-DD or ISO DateTime.`,
  );
}

/**
 * Helper to create date range filters for Prisma
 */
export function createDateRangeFilter(
  startDate: string,
  endDate: string,
  field: string = 'createdAt',
): Record<string, { gte: string; lte: string }> {
  return {
    [field]: {
      gte: normalizeDateForPrisma(startDate),
      lte: normalizeDateForPrisma(endDate + 'T23:59:59.999Z'), // End of day
    },
  };
}
