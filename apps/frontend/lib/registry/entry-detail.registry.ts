import { apiRoutes } from "@/lib/apiRoutes";
import type { EntityDetailConfig } from "../types/entity-details.types";

import { vehicleDetailConfig, Vehicle } from "@/configs/crud/vehicles.config";
import {
  vehicleDocumentDetailConfig,
  LinkageEntity,
} from "@/configs/crud/linkage.config";
import { driverDetailConfig, Driver } from "@/configs/crud/drivers.config";
import { ownerDetailConfig, Owner } from "@/configs/crud/owners.config";
import {
  locationDetailConfig,
  Location,
} from "@/configs/crud/locations.config";
import {
  documentTypeDetailConfig,
  DocumentType,
} from "@/configs/crud/document-types.config";

export type EntityTypeMap = {
  vehicles: Vehicle;
  vehicle_documents: LinkageEntity;
  driver: Driver;
  owner: Owner;
  location: Location;
  document_type: DocumentType;
};

export type EntityDetailRegistryItem<T> = {
  fetcher: (id: string) => string;
  detailConfig: EntityDetailConfig<T>;
  title: string;
};

export const ENTITY_DETAIL_REGISTRY: {
  [K in keyof EntityTypeMap]: EntityDetailRegistryItem<EntityTypeMap[K]>;
} = {
  vehicles: {
    fetcher: apiRoutes.vehicles.detail,
    detailConfig: vehicleDetailConfig,
    title: "Vehicle Details",
  },
  vehicle_documents: {
    fetcher: apiRoutes.vehicle_documents.detail,
    detailConfig: vehicleDocumentDetailConfig,
    title: "Linkage Details",
  },
  driver: {
    fetcher: apiRoutes.drivers.detail,
    detailConfig: driverDetailConfig,
    title: "Driver Details",
  },
  owner: {
    fetcher: apiRoutes.owners.detail,
    detailConfig: ownerDetailConfig,
    title: "Owner Details",
  },
  location: {
    fetcher: apiRoutes.locations.detail,
    detailConfig: locationDetailConfig,
    title: "Location Details",
  },
  document_type: {
    fetcher: apiRoutes.document_types.detail,
    detailConfig: documentTypeDetailConfig,
    title: "Document Type Details",
  },
};
