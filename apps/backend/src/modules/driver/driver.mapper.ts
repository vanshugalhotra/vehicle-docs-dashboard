import { Driver } from '@prisma/client';
import { DriverResponse } from 'src/common/types';

export function mapDriverToResponse(driver: Driver): DriverResponse {
  return {
    id: driver.id,
    name: driver.name,
    phone: driver.phone,
    email: driver.email,
    createdAt: driver.createdAt,
    updatedAt: driver.updatedAt,
  };
}
