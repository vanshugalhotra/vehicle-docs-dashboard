export interface VehicleTypeResponse {
  id: string;
  name: string;
  categoryId: string;
  createdAt: string | Date;
  updatedAt: string | Date;

  // Optional — for frontend enrichment
  categoryName?: string | null;
}
