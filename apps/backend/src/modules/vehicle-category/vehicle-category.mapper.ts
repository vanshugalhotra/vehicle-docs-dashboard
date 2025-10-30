import { VehicleCategory, VehicleType } from '@prisma/client';
import { VehicleCategoryResponse } from 'src/common/types';

type VehicleCategoryWithRelations = VehicleCategory & {
  types?: VehicleType[] | null;
};

export function mapCategoryToResponse(
  category: VehicleCategoryWithRelations,
): VehicleCategoryResponse {
  return {
    id: category.id,
    name: category.name,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,

    // Optional enriched info
    types: category.types?.map((type) => ({
      id: type.id,
      name: type.name,
      categoryId: type.categoryId,
      createdAt: type.createdAt,
      updatedAt: type.updatedAt,
    })),
  };
}
