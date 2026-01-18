const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3333";
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
  document_types: {
    base: `${API_URL}/document-types`,
    list: `${API_URL}/document-types`,
    detail: (id: string) => `${API_URL}/document-types/${id}`,
  },
  vehicle_documents: {
    base: `${API_URL}/vehicle-documents`,
    list: `${API_URL}/vehicle-documents`,
    detail: (id: string) => `${API_URL}/vehicle-documents/${id}`,
  },
  stats: {
    overview: `${API_URL}/stats/overview`,
    vehiclesGrouped: `${API_URL}/stats/vehicles/grouped`,
    vehiclesCreatedTrend: `${API_URL}/stats/vehicles/created-trend`,
    documentsExpiryDistribution: `${API_URL}/stats/documents/expiry-distribution`,
  },
  reminder_recipient: {
    base: `${API_URL}/reminders/recipients`,
    list: `${API_URL}/reminders/recipients`,
    detail: (id: string) => `${API_URL}/reminders/recipients/${id}`,
  },
  reminder_trigger: {
    base: `${API_URL}/reminders/trigger`,
  },
  reminder_reschedule: {
    base: `${API_URL}/reminders/reschedule`,
  },
  auth: {
    login: `${API_URL}/auth/login`,
    logout: `${API_URL}/auth/logout`,
    me: `${API_URL}/auth/me`,
    register_requestOTP: `${API_URL}/auth/register/request-otp`,
    register_verifyOTP: `${API_URL}/auth/register/verify-otp`,
    forgetpass_requestOTP: `${API_URL}/auth/forgot-password/request-otp`,
    forgetpass_verifyOTP: `${API_URL}/auth/forgot-password/reset`,
  },
  export: {
    base: `${API_URL}/export`,
  },
  audit: {
    base: `${API_URL}/audit-logs`,
    entity: (entityType: string, entityId: string) =>
      `${API_URL}/audit-logs/entity/${entityType}/${entityId}`,
    detail: (id: string) => `${API_URL}/${id}`,
  },
};
