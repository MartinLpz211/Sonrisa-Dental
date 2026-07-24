/** Refleja el enum AppointmentStatus de schema.prisma */
export type AppointmentStatus = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA' | 'REAGENDADA';

/** Paciente embebido en la cita (subconjunto de User) */
export interface AppointmentPatient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

/** Servicio embebido en la cita (subconjunto de Service) */
export interface AppointmentService {
  id: number;
  name: string;
  price: number;
  duration: number;
  imageUrl: string | null;
}

/** Forma de una cita tal como la devuelve /api/appointments */
export interface Appointment {
  id: number;
  date: string; // ISO — solo representa el día
  startTime: string; // "HH:mm"
  status: AppointmentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  patient: AppointmentPatient;
  service: AppointmentService;
}

export interface AppointmentsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** data en GET /api/appointments */
export interface AppointmentsListResponse {
  appointments: Appointment[];
  pagination: AppointmentsPagination;
}

/** Query params aceptados por GET /api/appointments */
export interface AppointmentsQuery {
  search?: string;
  serviceId?: number;
  status?: AppointmentStatus;
  date?: string; // YYYY-MM-DD
  page?: number;
  limit?: number;
}
// ...lo ya generado en el Paso 1, más:

export interface AvailabilityQuery {
  date: string; // YYYY-MM-DD
  serviceId: number;
  excludeAppointmentId?: number;
}

export interface AvailabilityResponse {
  date: string;
  serviceId: number;
  slots: string[]; // ["09:00", "09:30", ...]
}

export interface CreateAppointmentPayload {
  patientId: number;
  serviceId: number;
  date: string;
  startTime: string;
  notes?: string | null;
}

export interface RescheduleAppointmentPayload {
  date: string;
  startTime: string;
}

// AppointmentsQuery del Paso 1 se extiende con:
export interface AppointmentsQuery {
  search?: string;
  serviceId?: number;
  status?: AppointmentStatus;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}