import { Location } from '@prisma/client';
import { LocationResponse } from 'src/common/types';

export function mapLocationToResponse(location: Location): LocationResponse {
  return {
    id: location.id,
    name: location.name,
    createdAt: location.createdAt,
    updatedAt: location.updatedAt,
  };
}
