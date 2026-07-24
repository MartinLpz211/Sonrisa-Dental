/** GET /api/dashboard/stats -> data.totals */
export interface DashboardTotals {
  totalPatients: number;
  totalServices: number;
  totalAppointments: number;
  appointmentsToday: number;
  appointmentsPending: number;
  appointmentsCompleted: number;
}

/** data.topServices[i] */
export interface TopService {
  serviceId: number;
  name: string;
  appointmentsCount: number;
}

/** Estados posibles de una cita (deben coincidir con el enum del backend) */
export type AppointmentStatus = 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';

/** data.upcomingAppointments[i] */
export interface UpcomingAppointment {
  id: number;
  date: string;
  startTime: string;
  status: AppointmentStatus;
  patient: { id: number; firstName: string; lastName: string };
  service: { id: number; name: string };
}

/** data.recentPatients[i] */
export interface RecentPatient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
}

/** data.appointmentsByMonth[i] — ya viene ordenado y sin huecos */
export interface AppointmentsByMonth {
  month: string; // 'YYYY-MM'
  count: number;
}

/** Forma completa de data en GET /api/dashboard/stats */
export interface DashboardStats {
  totals: DashboardTotals;
  topServices: TopService[];
  upcomingAppointments: UpcomingAppointment[];
  recentPatients: RecentPatient[];
  appointmentsByMonth: AppointmentsByMonth[];
}
