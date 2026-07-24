import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats, AppointmentStatus } from '../../interfaces/dashboard.interface';

interface StatCard {
  label: string;
  value: number;
  icon: string;
  color: string;
}

/** Colores de la paleta del proyecto para cada estado de cita. */
const STATUS_STYLES: Record<AppointmentStatus, { label: string; color: string }> = {
  PENDIENTE: { label: 'Pendiente', color: '#F9A825' },
  CONFIRMADA: { label: 'Confirmada', color: '#1976D2' },
  COMPLETADA: { label: 'Completada', color: '#2E7D32' },
  CANCELADA: { label: 'Cancelada', color: '#C62828' },
};

const MONTH_LABELS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  readonly stats = signal<DashboardStats | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  /** Tarjetas de resumen, derivadas de los totales de la API. */
  readonly cards = computed<StatCard[]>(() => {
    const totals = this.stats()?.totals;
    if (!totals) return [];
    return [
      { label: 'Pacientes registrados', value: totals.totalPatients, icon: '👥', color: '#1976D2' },
      { label: 'Servicios', value: totals.totalServices, icon: '🦷', color: '#1976D2' },
      { label: 'Citas totales', value: totals.totalAppointments, icon: '📅', color: '#1976D2' },
      { label: 'Citas de hoy', value: totals.appointmentsToday, icon: '📆', color: '#1976D2' },
      { label: 'Citas pendientes', value: totals.appointmentsPending, icon: '⏳', color: '#F9A825' },
      { label: 'Citas completadas', value: totals.appointmentsCompleted, icon: '✅', color: '#2E7D32' },
    ];
  });

  /** Barras de la gráfica de citas por mes, ya con altura porcentual calculada. */
  readonly chartBars = computed(() => {
    const data = this.stats()?.appointmentsByMonth ?? [];
    const max = Math.max(1, ...data.map((d) => d.count)); // evita división por 0
    return data.map((d) => {
      const [year, month] = d.month.split('-');
      return {
        count: d.count,
        heightPct: Math.round((d.count / max) * 100),
        label: `${MONTH_LABELS[Number(month) - 1]} ${year.slice(2)}`,
      };
    });
  });

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading.set(true);
    this.error.set(null);
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las estadísticas. Intenta de nuevo.');
        this.loading.set(false);
      },
    });
  }

  statusLabel(status: AppointmentStatus): string {
    return STATUS_STYLES[status]?.label ?? status;
  }

  statusColor(status: AppointmentStatus): string {
    return STATUS_STYLES[status]?.color ?? '#757575';
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  }
}
