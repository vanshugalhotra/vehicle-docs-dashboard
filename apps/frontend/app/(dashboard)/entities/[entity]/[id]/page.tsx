"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";

import { EntityDetailsPage } from "@/components/crud/EntityDetailsPage";
import { EntityDetailsCard } from "@/components/crud/EntityDetailsCard/EntityDetailsCard";
import { useEntityDetail } from "@/hooks/useEntityDetails";
import { AppButton } from "@/components/ui/AppButton";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";

import {
  ENTITY_DETAIL_REGISTRY,
  EntityTypeMap,
  mapToAuditEntity,
} from "@/lib/registry/entry-detail.registry";
import { EntityDetailConfig } from "@/lib/types/entity-details.types";

import { useAuditLogsController } from "@/hooks/useAuditLogsController";
import { AuditLogsPage } from "@/components/audit/AuditLogsPage";
import {
  getAuditFiltersConfig,
  auditSortOptions,
  auditDefaults,
} from "@/configs/audit.config";

export default function EntityDetailsRoutePage() {
  const router = useRouter();
  const params = useParams();

  const entity = params.entity as keyof EntityTypeMap;
  const id = params.id as string;

  const registryEntry = ENTITY_DETAIL_REGISTRY[entity];

  const { data, isLoading, error } = useEntityDetail({
    queryKey: registryEntry
      ? `${entity}-detail-${id}`
      : `${entity}-detail-disabled`,
    fetcher: registryEntry?.fetcher ?? (() => ""),
    id,
    enabled: !!registryEntry && !!id,
  });

  const auditEntity = mapToAuditEntity(entity);

  const auditController = useAuditLogsController({
    mode: "entity",
    entityType: auditEntity,
    entityId: id,
    defaultPageSize: auditDefaults.pageSize,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="space-y-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <div>
            <p className="text-sm font-medium text-text-primary mb-1">
              Loading {registryEntry?.title?.toLowerCase() || "details"}
            </p>
            <p className="text-xs text-text-tertiary">Please wait a moment</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="space-y-4 text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary mb-1">
              Unable to load details
            </h3>
            <p className="text-sm text-text-secondary">
              There was an error loading the entity information.
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <AppButton
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </AppButton>
            <AppButton
              variant="primary"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Try again
            </AppButton>
          </div>
        </div>
      </div>
    );
  }

  if (!registryEntry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="space-y-4 text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-border-subtle">
            <AlertCircle className="h-5 w-5 text-text-tertiary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary mb-1">
              Unsupported entity
            </h3>
            <p className="text-sm text-text-secondary">
              The entity type &quot;{entity}&quot; is not supported.
            </p>
          </div>
          <AppButton
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Go back
          </AppButton>
        </div>
      </div>
    );
  }

  return (
    <EntityDetailsPage
      title={registryEntry.title}
      actions={
        <AppButton
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </AppButton>
      }
      tabs={[
        { key: "details", label: "Details" },
        { key: "history", label: "History" },
      ]}
      initialTabKey="details"
      renderTab={(tabKey) => {
        if (tabKey === "details") {
          const typedData = data as EntityTypeMap[typeof entity];
          const typedConfig = registryEntry.detailConfig as EntityDetailConfig<
            typeof typedData
          >;
          return (
            <EntityDetailsCard
              data={typedData}
              loading={isLoading}
              config={typedConfig}
            />
          );
        }

        if (tabKey === "history") {
          return (
            <AuditLogsPage
              title="Audit History"
              data={auditController.data}
              loading={auditController.isLoading}
              filtersConfig={getAuditFiltersConfig({
                includeEntityFilters: false,
              })}
              filters={auditController.filters}
              onFiltersChange={auditController.setFilters}
              sortOptions={auditSortOptions}
              sort={auditController.sort}
              onSortChange={auditController.setSort}
              search={auditController.filters.search as string}
              onSearchChange={(val) =>
                auditController.setFilters((prev) => ({ ...prev, search: val }))
              }
              page={auditController.page}
              pageSize={auditController.pageSize}
              totalCount={auditController.total}
              onPageChange={auditController.setPage}
              onPageSizeChange={auditController.setPageSize}
            />
          );
        }

        return null;
      }}
    />
  );
}
