import {
  Vehicle,
  VehicleCategory,
  VehicleType,
  Owner,
  Driver,
  Location,
  VehicleDocument,
} from '@prisma/client';

import { VehicleResponse } from 'src/common/types';

type VehicleWithRelations = Vehicle & {
  category?: VehicleCategory | null;
  type?: VehicleType | null;
  owner?: Owner | null;
  driver?: Driver | null;
  location?: Location | null;
  documents?: (VehicleDocument & {
    documentType?: { name: string } | null;
  })[];
};

export function mapVehicleToResponse(
  vehicle: VehicleWithRelations,
): VehicleResponse {
  return {
    id: vehicle.id,
    name: vehicle.name,
    licensePlate: vehicle.licensePlate,
    rcNumber: vehicle.rcNumber,
    chassisNumber: vehicle.chassisNumber,
    engineNumber: vehicle.engineNumber,
    notes: vehicle.notes ?? null,
    categoryId: vehicle.categoryId,
    typeId: vehicle.typeId,
    ownerId: vehicle.ownerId ?? null,
    driverId: vehicle.driverId ?? null,
    locationId: vehicle.locationId ?? null,
    createdAt: vehicle.createdAt,
    updatedAt: vehicle.updatedAt,

    // Optional enriched info (frontend-ready)
    categoryName: vehicle.category?.name ?? null,
    typeName: vehicle.type?.name ?? null,
    ownerName: vehicle.owner?.name ?? null,
    driverName: vehicle.driver?.name ?? null,
    locationName: vehicle.location?.name ?? null,
    documents:
      vehicle.documents?.map((d) => ({
        id: d.id,
        documentTypeName: d.documentType?.name ?? null,
      })) ?? [],
  };
}
