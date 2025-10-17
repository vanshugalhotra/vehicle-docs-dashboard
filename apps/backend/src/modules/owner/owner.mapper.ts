import { Owner } from '@prisma/client';
import { OwnerResponse } from 'src/common/types';

export function mapOwnerToResponse(owner: Owner): OwnerResponse {
  return {
    id: owner.id,
    name: owner.name,
    createdAt: owner.createdAt,
    updatedAt: owner.updatedAt,
  };
}
