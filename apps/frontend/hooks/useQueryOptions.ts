"use client";

import { useState, useMemo, useCallback } from "react";
import { debounce } from "@/lib/utils/debounce";
import { serializeFilters } from "@/lib/utils/filterUtils";
import type { FiltersObject, SortState, QueryOptions, QueryController } from "@/lib/types/filter.types";

export function useQueryOptions(
  initial?: Partial<QueryOptions>,
  debounceMs = 400
): QueryController {
  const [search, setSearch] = useState(initial?.search);
  const [filters, _setFilters] = useState<FiltersObject>(initial?.filters ?? {});
  const [sort, setSortState] = useState<SortState>(initial?.sort ?? { field: "createdAt", order: "desc" });
  const [page, setPage] = useState(initial?.page ?? 1);
  const [pageSize, setPageSize] = useState(initial?.pageSize ?? 10);

  const skip = useMemo(() => (page - 1) * pageSize, [page, pageSize]);
  const take = useMemo(() => pageSize, [pageSize]);

  const debouncedSetFilters = useMemo(
    () =>
      debounce((f: FiltersObject) => {
        _setFilters({ ...f });
        setPage(1);
      }, debounceMs),
    [debounceMs]
  );

  const setFilters = useCallback(
    (f: FiltersObject) => debouncedSetFilters(f ?? {}),
    [debouncedSetFilters]
  );

  const setSort = useCallback(
    (field: string, order: "asc" | "desc") => {
      setSortState({ field, order });
      setPage(1);
    },
    []
  );

  const resetAll = useCallback(() => {
    setSearch("");
    _setFilters({});
    setSortState({ field: "createdAt", order: "desc" });
    setPage(1);
  }, []);

  const queryOptions = useMemo(
    () => ({
      skip,
      take,
      search: search ?? undefined,
      sortBy: sort.field ?? undefined,
      order: sort.order ?? undefined,
      filters: serializeFilters(filters),
    }),
    [skip, take, search, sort, filters]
  );

  return {
    search,
    setSearch,
    filters,
    setFilters,
    sort,
    setSort,
    page,
    setPage,
    pageSize,
    setPageSize,
    skip,
    take,
    queryOptions,
    resetAll,
  };
}
