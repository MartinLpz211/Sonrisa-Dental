import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { AppointmentService } from '../../services/appointment.service';
import { ServiceService } from '../../services/service.service';
import { Appointment, AppointmentsPagination, AppointmentStatus } from '../../interfaces/appointment.interface';
import { Service } from '../../interfaces/service.interface';

type StatusFilter = 'all' | AppointmentStatus;

const PAGE_SIZE = 10;

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css'],
})
export class AdminAppointmentsComponent implements OnInit {
  readonly appointments = signal<Appointment[]>([]);
  readonly pagination = signal<AppointmentsPagination | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  // Servicios para poblar el <select> de filtro (reutiliza ServiceService, ya existente)
  readonly serviceOptions = signal<Service[]>([]);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<StatusFilter>('all');
  readonly serviceFilter = signal<number | null>(null);
  readonly dateFilter = signal<string>(''); // YYYY-MM-DD
  readonly page = signal(1);

  readonly statusOptions: AppointmentStatus[] = [
    'PENDIENTE',
    'CONFIRMADA',
    'REAGENDADA',
    'COMPLETADA',
    'CANCELADA',
  ];

  private readonly search$ = new Subject<string>();

  constructor(private appointmentService: AppointmentService, private serviceService: ServiceService) {}

  ngOnInit(): void {
    this.search$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => this.page.set(1)),
        switchMap(() => this.fetchAppointments())
      )
      .subscribe();

    this.loadAppointments();
    this.loadServiceOptions();
  }

  // ---------------------------------------------------------------
  // Carga de datos
  // ---------------------------------------------------------------

  loadAppointments(): void {
    this.fetchAppointments().subscribe();
  }

  private fetchAppointments() {
    this.loading.set(true);
    this.error.set(null);

    return this.appointmentService
      .getAll({
        search: this.searchTerm() || undefined,
        serviceId: this.serviceFilter() ?? undefined,
        status: this.statusFilter() !== 'all' ? (this.statusFilter() as AppointmentStatus) : undefined,
        date: this.dateFilter() || undefined,
        page: this.page(),
        limit: PAGE_SIZE,
      })
      .pipe(
        tap({
          next: (res) => {
            this.appointments.set(res.appointments);
            this.pagination.set(res.pagination);
            this.loading.set(false);
          },
          error: () => {
            this.error.set('No se pudo cargar la lista de citas.');
            this.loading.set(false);
          },
        })
      );
  }

  /** Solo trae servicios activos, para no ofrecer filtrar por uno dado de baja */
  private loadServiceOptions(): void {
    this.serviceService.getAll({ isActive: true, limit: 100 }).subscribe({
      next: (res) => this.serviceOptions.set(res.services),
      error: () => {
        /* El filtro de servicio simplemente queda vacío; no bloquea el listado principal */
      },
    });
  }

  // ---------------------------------------------------------------
  // Búsqueda y filtros
  // ---------------------------------------------------------------

  onSearchInput(value: string): void {
    this.searchTerm.set(value);
    this.search$.next(value);
  }

  onStatusFilterChange(value: string): void {
    this.statusFilter.set(value as StatusFilter);
    this.page.set(1);
    this.loadAppointments();
  }

  onServiceFilterChange(value: string): void {
    this.serviceFilter.set(value ? Number(value) : null);
    this.page.set(1);
    this.loadAppointments();
  }

  onDateFilterChange(value: string): void {
    this.dateFilter.set(value);
    this.page.set(1);
    this.loadAppointments();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('all');
    this.serviceFilter.set(null);
    this.dateFilter.set('');
    this.page.set(1);
    this.loadAppointments();
  }

  goToPage(newPage: number): void {
    const total = this.pagination()?.totalPages ?? 1;
    if (newPage < 1 || newPage > total) return;
    this.page.set(newPage);
    this.loadAppointments();
  }

  // ---------------------------------------------------------------
  // Utilidades de presentación
  // ---------------------------------------------------------------

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: '2-digit' });
  }

  statusLabel(status: AppointmentStatus): string {
    const labels: Record<AppointmentStatus, string> = {
      PENDIENTE: 'Pendiente',
      CONFIRMADA: 'Confirmada',
      CANCELADA: 'Cancelada',
      COMPLETADA: 'Completada',
      REAGENDADA: 'Reagendada',
    };
    return labels[status];
  }
}