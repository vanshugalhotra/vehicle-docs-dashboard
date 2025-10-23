const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3333";
const PREFIX = "api/v1";

const API_URL = `${BASE_URL}/${PREFIX}`;

export const apiRoutes = {
  vehicles: {
    base: `${API_URL}/vehicles`,
    list: `${API_URL}/vehicles`,
    detail: (id: string) => `${API_URL}/vehicles/${id}`,
  },
  drivers: {
    base: `${API_URL}/drivers`,
    list: `${API_URL}/drivers`,
    detail: (id: string) => `${API_URL}/drivers/${id}`,
  },
  owners: {
    base: `${API_URL}/owners`,
    list: `${API_URL}/owners`,
    detail: (id: string) => `${API_URL}/owners/${id}`,
  },
  locations: {
    base: `${API_URL}/locations`,
    list: `${API_URL}/locations`,
    detail: (id: string) => `${API_URL}/locations/${id}`,
  },
  vehicle_categories: {
    base: `${API_URL}/vehicle-categories`,
    list: `${API_URL}/vehicle-categories`,
    detail: (id: string) => `${API_URL}/vehicle-categories/${id}`,
  },
  vehicle_types: {
    base: `${API_URL}/vehicle-types`,
    list: `${API_URL}/vehicle-types`,
    detail: (id: string) => `${API_URL}/vehicle-types/${id}`,
  },
};
