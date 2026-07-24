import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { ReportsSummary } from '../../interfaces/report.interface';
import { AppointmentStatus } from '../../interfaces/appointment.interface';

type Preset = 'today' | 'week' | 'month' | 'last30' | 'custom';

/** Mismo mapeo de colores por estado que ya usa admin-dashboard.component.ts */
const STATUS_STYLES: Record<AppointmentStatus, { label: string; color: string }> = {
  PENDIENTE: { label: 'Pendiente', color: '#F9A825' },
  CONFIRMADA: { label: 'Confirmada', color: '#1976D2' },
  COMPLETADA: { label: 'Completada', color: '#2E7D32' },
  CANCELADA: { label: 'Cancelada', color: '#C62828' },
  REAGENDADA: { label: 'Reagendada', color: '#6A1B9A' },
};

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class AdminReportsComponent implements OnInit {
  readonly summary = signal<ReportsSummary | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly dateFrom = signal<string>('');
  readonly dateTo = signal<string>('');
  readonly activePreset = signal<Preset>('month');

  /** Tarjetas de resumen, derivadas de los totales de la API */
  readonly cards = computed(() => {
    const totals = this.summary()?.totals;
    if (!totals) return [];
    return [
      { label: 'Citas en el periodo', value: totals.totalAppointments, icon: '📅', isCurrency: false },
      { label: 'Citas completadas', value: totals.completedAppointments, icon: '✅', isCurrency: false },
      { label: 'Citas canceladas', value: totals.cancelledAppointments, icon: '🚫', isCurrency: false },
      { label: 'Pacientes nuevos', value: totals.newPatients, icon: '👥', isCurrency: false },
      { label: 'Ingresos (citas completadas)', value: totals.totalRevenue, icon: '💰', isCurrency: true },
    ];
  });

  /** Barras de la gráfica de citas por día, con altura porcentual ya calculada (mismo patrón que el Dashboard) */
  readonly chartBars = computed(() => {
    const data = this.summary()?.byDay ?? [];
    const max = Math.max(1, ...data.map((d) => d.count));
    return data.map((d) => ({
      count: d.count,
      revenue: d.revenue,
      heightPct: Math.round((d.count / max) * 100),
      label: this.formatShortDate(d.date),
    }));
  });

  readonly statusRows = computed(() => {
    const data = this.summary()?.byStatus ?? [];
    const total = data.reduce((sum, s) => sum + s.count, 0) || 1;
    return data.map((s) => ({
      status: s.status,
      count: s.count,
      pct: Math.round((s.count / total) * 100),
      label: STATUS_STYLES[s.status]?.label ?? s.status,
      color: STATUS_STYLES[s.status]?.color ?? '#757575',
    }));
  });

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.applyPreset('month');
  }

  applyPreset(preset: Preset): void {
    const today = new Date();
    let from: Date;
    let to: Date = today;

    switch (preset) {
      case 'today':
        from = today;
        break;
      case 'week': {
        const day = today.getDay(); // 0=domingo
        const diffToMonday = day === 0 ? 6 : day - 1;
        from = new Date(today);
        from.setDate(today.getDate() - diffToMonday);
        break;
      }
      case 'last30':
        from = new Date(today);
        from.setDate(today.getDate() - 29);
        break;
      case 'month':
      default:
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
    }

    this.activePreset.set(preset);
    this.dateFrom.set(this.toISO(from));
    this.dateTo.set(this.toISO(to));
    this.loadSummary();
  }

  onDateFromChange(value: string): void {
    this.dateFrom.set(value);
    this.activePreset.set('custom');
  }

  onDateToChange(value: string): void {
    this.dateTo.set(value);
    this.activePreset.set('custom');
  }

  applyCustomRange(): void {
    if (!this.dateFrom() || !this.dateTo()) {
      this.error.set('Selecciona ambas fechas.');
      return;
    }
    if (this.dateFrom() > this.dateTo()) {
      this.error.set('La fecha inicial no puede ser posterior a la final.');
      return;
    }
    this.loadSummary();
  }

  loadSummary(): void {
    this.loading.set(true);
    this.error.set(null);

    this.reportService.getSummary({ dateFrom: this.dateFrom(), dateTo: this.dateTo() }).subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo generar el reporte. Intenta de nuevo.');
        this.loading.set(false);
      },
    });
  }

  private toISO(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private formatShortDate(iso: string): string {
    const [, month, day] = iso.split('-');
    return `${day}/${month}`;
  }
}
