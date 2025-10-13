export interface VehicleResponse {
  id: string;
  name: string;
  licensePlate: string;
  rcNumber: string;
  chassisNumber: string;
  engineNumber: string;
  notes: string | null;
  categoryId: string;
  typeId: string;
  ownerId: string | null;
  driverId: string | null;
  locationId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;

  // Optional — for richer frontend data
  categoryName?: string | null;
  typeName?: string | null;
  ownerName?: string | null;
  driverName?: string | null;
  locationName?: string | null;
}
