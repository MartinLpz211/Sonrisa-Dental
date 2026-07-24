/**
 * Forma de un paciente tal como lo devuelve /api/patients.
 * Nota: NO es lo mismo que `User` (interfaces/user.interface.ts):
 * ese endpoint nunca expone `roleId` ni `role`, y en cambio agrega
 * `totalAppointments` (calculado en el backend).
 */
export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalAppointments: number;
}

export interface PatientsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** data en GET /api/patients */
export interface PatientsListResponse {
  patients: Patient[];
  pagination: PatientsPagination;
}

/** Query params aceptados por GET /api/patients */
export interface PatientsQuery {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

/** Body aceptado por PATCH /api/patients/:id */
export interface UpdatePatientPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  birthDate?: string | null;
}
