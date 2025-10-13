import { VehicleTypeResponse } from './vehicle-type.types';

export interface VehicleCategoryResponse {
  id: string;
  name: string;
  createdAt: string | Date;
  updatedAt: string | Date;

  // Optional — for frontend enrichment
  types?: VehicleTypeResponse[];
}
