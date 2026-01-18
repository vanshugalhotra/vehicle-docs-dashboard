import { apiRoutes } from "@/lib/apiRoutes";
import type { FilterConfig, SortOption } from "@/lib/types/filter.types";
import { AuditAction, AuditEntity } from "@/lib/types/audit.types";

export const auditQueryKey = "audit-logs";

export const auditApi = {
  global: apiRoutes.audit.base,
  entity: apiRoutes.audit.entity,
  detail: apiRoutes.audit.detail,
};

const enumToOptions = <T extends Record<string, string>>(e: T) =>
  Object.values(e).map((value) => ({
    label: value.replace(/_/g, " "),
    value,
  }));

/* ======================================================
 * Filters
 * ====================================================== */

export const auditBaseFiltersConfig: FilterConfig[] = [
  {
    key: "action",
    label: "Action",
    type: "select",
    options: enumToOptions(AuditAction),
    ui: {
      compact: true,
    },
  },
  {
    key: "createdAt",
    label: "Creation Date",
    type: "dateRange",
  },
];

export const auditGlobalOnlyFiltersConfig: FilterConfig[] = [
  {
    key: "entityType",
    label: "Entity Type",
    type: "tab",
    options: [{ label: "All", value: "" }, ...enumToOptions(AuditEntity)],
    ui: {
      compact: true,
    },
  },
];

export function getAuditFiltersConfig(options: {
  includeEntityFilters?: boolean;
}) {
  const { includeEntityFilters = false } = options;

  return [
    ...auditBaseFiltersConfig,
    ...(includeEntityFilters ? auditGlobalOnlyFiltersConfig : []),
  ];
}

export const auditSortOptions: SortOption[] = [
  {
    field: "createdAt",
    label: "Date",
    default: true,
  },
];

export const auditDefaults = {
  pageSize: 10,
  sort: {
    field: "createdAt",
    order: "desc" as const,
  },
};
