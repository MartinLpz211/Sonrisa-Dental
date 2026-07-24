/**
 * Forma de un servicio dental tal como lo devuelve /api/services.
 * Igual que `Patient`, agrega `totalAppointments` (calculado en el
 * backend a partir de la relación con Appointment) para usarse en
 * la tabla del admin.
 */
export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalAppointments: number;
}

export interface ServicesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** data en GET /api/services */
export interface ServicesListResponse {
  services: Service[];
  pagination: ServicesPagination;
}

/** Query params aceptados por GET /api/services */
export interface ServicesQuery {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

/** Body aceptado por POST /api/services */
export interface CreateServicePayload {
  name: string;
  description: string;
  price: number;
  duration: number;
  imageUrl?: string | null;
}

/** Body aceptado por PATCH /api/services/:id */
export interface UpdateServicePayload {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  imageUrl?: string | null;
}
