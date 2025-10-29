import { QueryOptionsDto } from '../dto/query-options.dto';

/**
 * Generic Prisma query builder that supports:
 * - Pagination (`skip`, `take`)
 * - Search across multiple fields (`searchableFields`)
 * - Sorting (`sortBy`, `order`)
 * - Dynamic filters (`filters`)
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

  // Safely parse filters with error handling
  let filters: Record<string, unknown> = {};
  if (dto.filters) {
    try {
      const parsed: unknown =
        typeof dto.filters === 'string' ? JSON.parse(dto.filters) : dto.filters;
      if (parsed && typeof parsed === 'object') {
        filters = parsed as Record<string, unknown>;
      } else {
        filters = {};
      }
    } catch (error) {
      // Log error but don't fail the request - treat as no filters
      console.warn('Invalid filters JSON:', dto.filters, error);
      filters = {};
    }
  }

  const where: Record<string, unknown> = {};

  // Add search condition (case-insensitive OR)
  if (search && searchableFields.length > 0) {
    where.OR = searchableFields.map((field) => ({
      [field]: { contains: search, mode: 'insensitive' },
    }));
  }

  // Add filters (exact matches or arrays)
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      // Multi-value filters (e.g., typeId=["t1", "t2"])
      where[key] = { in: value };
    } else {
      // Single-value filters
      where[key] = value;
    }
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
