export interface DriverResponse {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}
