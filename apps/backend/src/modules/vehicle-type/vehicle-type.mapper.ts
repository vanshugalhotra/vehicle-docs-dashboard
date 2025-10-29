import { VehicleType, VehicleCategory } from '@prisma/client';
import { VehicleTypeResponse } from 'src/common/types';

type VehicleTypeWithRelations = VehicleType & {
  category?: VehicleCategory | null;
};

export function mapTypeToResponse(
  type: VehicleTypeWithRelations,
): VehicleTypeResponse {
  return {
    id: type.id,
    name: type.name,
    categoryId: type.categoryId,
    createdAt: type.createdAt,
    updatedAt: type.updatedAt,

    // Optional enriched info
    categoryName: type.category?.name ?? null,
  };
}
