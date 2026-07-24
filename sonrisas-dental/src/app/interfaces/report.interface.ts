import { AppointmentStatus } from './appointment.interface';

/** Query params aceptados por GET /api/reports/summary */
export interface ReportsQuery {
  dateFrom: string; // YYYY-MM-DD
  dateTo: string; // YYYY-MM-DD
}

export interface ReportsTotals {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  rescheduledAppointments: number;
  totalRevenue: number;
  newPatients: number;
}

export interface ReportsByService {
  serviceId: number;
  name: string;
  count: number;
  revenue: number;
}

export interface ReportsByStatus {
  status: AppointmentStatus;
  count: number;
}

export interface ReportsByDay {
  date: string; // YYYY-MM-DD
  count: number;
  revenue: number;
}

/** data en GET /api/reports/summary */
export interface ReportsSummary {
  range: { dateFrom: string; dateTo: string };
  totals: ReportsTotals;
  byService: ReportsByService[];
  byStatus: ReportsByStatus[];
  byDay: ReportsByDay[];
}
