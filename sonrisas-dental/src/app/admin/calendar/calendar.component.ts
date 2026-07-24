import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, switchMap, tap } from 'rxjs';
import { AppointmentService } from '../../services/appointment.service';
import { ServiceService } from '../../services/service.service';
import { PatientService } from '../../services/patient.service';
import { Appointment, AppointmentStatus } from '../../interfaces/appointment.interface';
import { Service } from '../../interfaces/service.interface';
import { Patient } from '../../interfaces/patient.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../../interfaces/auth.interface';

interface DayCell {
  date: Date;
  iso: string; // YYYY-MM-DD
  inCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  appointments: Appointment[];
}

type ModalMode = 'create' | 'reschedule' | null;

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

@Component({
  selector: 'app-admin-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class AdminCalendarComponent implements OnInit {
  readonly weekdayLabels = WEEKDAY_LABELS;

  readonly viewDate = signal(new Date()); // cualquier día del mes visible
  readonly days = signal<DayCell[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly monthLabel = computed(() =>
    this.viewDate().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
  );

  /** Día seleccionado para ver el detalle (null = panel cerrado) */
  readonly selectedDay = signal<DayCell | null>(null);

  // ---------- Modal crear / reagendar ----------
  readonly modalMode = signal<ModalMode>(null);
  readonly appointmentBeingRescheduled = signal<Appointment | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly feedback = signal<string | null>(null);

  readonly services = signal<Service[]>([]);
  readonly selectedServiceId = signal<number | null>(null);
  readonly selectedService = computed(
    () => this.services().find((s) => s.id === this.selectedServiceId()) ?? null
  );

  readonly patientSearch = signal('');
  readonly patientResults = signal<Patient[]>([]);
  readonly selectedPatient = signal<Patient | null>(null);
  private readonly patientSearch$ = new Subject<string>();

  readonly formDate = signal<string>(''); // YYYY-MM-DD
  readonly availableSlots = signal<string[]>([]);
  readonly loadingSlots = signal(false);
  readonly selectedSlot = signal<string | null>(null);
  readonly notes = signal('');

  constructor(
    private appointmentService: AppointmentService,
    private serviceService: ServiceService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.patientSearch$
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((term) =>
          this.patientService.getAll({ search: term || undefined, isActive: true, page: 1, limit: 10 })
        )
      )
      .subscribe({
        next: (res) => this.patientResults.set(res.patients),
        error: () => this.patientResults.set([]),
      });

    this.serviceService.getAll({ isActive: true, limit: 100 }).subscribe({
      next: (res) => this.services.set(res.services),
      error: () => {
        /* el selector de servicio simplemente queda vacío */
      },
    });

    this.loadMonth();
  }

  // ---------------------------------------------------------------
  // Construcción del grid del mes + carga de citas del rango visible
  // ---------------------------------------------------------------

  private buildMonthGrid(base: Date): DayCell[] {
    const year = base.getFullYear();
    const month = base.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay(); // 0=domingo
    const gridStart = new Date(year, month, 1 - startOffset);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cells: DayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + i);
      date.setHours(0, 0, 0, 0);

      cells.push({
        date,
        iso: this.toISO(date),
        inCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        isPast: date.getTime() < today.getTime(),
        appointments: [],
      });
    }
    return cells;
  }

  loadMonth(): void {
    const grid = this.buildMonthGrid(this.viewDate());
    this.days.set(grid);
    this.loading.set(true);
    this.error.set(null);

    const dateFrom = grid[0].iso;
    const dateTo = grid[grid.length - 1].iso;

    this.appointmentService.getAll({ dateFrom, dateTo, limit: 100 }).subscribe({
      next: (res) => {
        const byDate = new Map<string, Appointment[]>();
        for (const appt of res.appointments) {
          const key = appt.date.substring(0, 10);
          if (!byDate.has(key)) byDate.set(key, []);
          byDate.get(key)!.push(appt);
        }
        this.days.update((cells) =>
          cells.map((c) => ({ ...c, appointments: (byDate.get(c.iso) ?? []).sort((a, b) => a.startTime.localeCompare(b.startTime)) }))
        );
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las citas del mes.');
        this.loading.set(false);
      },
    });
  }

  prevMonth(): void {
    const d = new Date(this.viewDate());
    d.setMonth(d.getMonth() - 1);
    this.viewDate.set(d);
    this.loadMonth();
  }

  nextMonth(): void {
    const d = new Date(this.viewDate());
    d.setMonth(d.getMonth() + 1);
    this.viewDate.set(d);
    this.loadMonth();
  }

  goToday(): void {
    this.viewDate.set(new Date());
    this.loadMonth();
  }

  selectDay(day: DayCell): void {
    this.selectedDay.set(day);
  }

  closeDayPanel(): void {
    this.selectedDay.set(null);
  }

  // ---------------------------------------------------------------
  // Modal: nueva cita
  // ---------------------------------------------------------------

  openCreate(day: DayCell): void {
    this.formError.set(null);
    this.appointmentBeingRescheduled.set(null);
    this.selectedPatient.set(null);
    this.patientResults.set([]);
    this.patientSearch.set('');
    this.selectedServiceId.set(null);
    this.formDate.set(day.iso);
    this.availableSlots.set([]);
    this.selectedSlot.set(null);
    this.notes.set('');
    this.modalMode.set('create');
  }

  openReschedule(appt: Appointment): void {
    this.formError.set(null);
    this.appointmentBeingRescheduled.set(appt);
    this.selectedServiceId.set(appt.service.id);
    this.formDate.set(appt.date.substring(0, 10));
    this.availableSlots.set([]);
    this.selectedSlot.set(appt.startTime);
    this.modalMode.set('reschedule');
    this.fetchSlots();
  }

  closeModal(): void {
    this.modalMode.set(null);
  }

  onPatientSearchInput(value: string): void {
    this.patientSearch.set(value);
    this.selectedPatient.set(null);
    this.patientSearch$.next(value);
  }

  pickPatient(patient: Patient): void {
    this.selectedPatient.set(patient);
    this.patientResults.set([]);
    this.patientSearch.set(`${patient.firstName} ${patient.lastName}`);
  }

  onServiceChange(value: string): void {
    this.selectedServiceId.set(value ? Number(value) : null);
    this.fetchSlots();
  }

  onFormDateChange(value: string): void {
    this.formDate.set(value);
    this.fetchSlots();
  }

  private fetchSlots(): void {
    const serviceId = this.selectedServiceId();
    const date = this.formDate();
    if (!serviceId || !date) {
      this.availableSlots.set([]);
      return;
    }

    this.loadingSlots.set(true);
    this.selectedSlot.set(null);
    this.formError.set(null);

    const excludeAppointmentId = this.appointmentBeingRescheduled()?.id;

    this.appointmentService.getAvailability({ date, serviceId, excludeAppointmentId }).subscribe({
      next: (res) => {
        this.availableSlots.set(res.slots);
        this.loadingSlots.set(false);
        if (res.slots.length === 0) {
          this.formError.set('No hay horarios disponibles ese día para el servicio seleccionado.');
        }
      },
      error: (err: HttpErrorResponse) => {
        const body = err.error as ApiErrorResponse | undefined;
        this.formError.set(body?.message ?? 'No se pudo consultar la disponibilidad.');
        this.availableSlots.set([]);
        this.loadingSlots.set(false);
      },
    });
  }

  pickSlot(slot: string): void {
    this.selectedSlot.set(slot);
  }

  save(): void {
    const serviceId = this.selectedServiceId();
    const date = this.formDate();
    const startTime = this.selectedSlot();

    if (!serviceId) {
      this.formError.set('Selecciona un servicio.');
      return;
    }
    if (!date || !startTime) {
      this.formError.set('Selecciona fecha y horario.');
      return;
    }

    this.saving.set(true);
    this.formError.set(null);

    if (this.modalMode() === 'reschedule') {
      const appt = this.appointmentBeingRescheduled();
      if (!appt) return;

      this.appointmentService.reschedule(appt.id, { date, startTime }).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.showFeedback('Cita reagendada correctamente.');
          this.loadMonth();
        },
        error: (err: HttpErrorResponse) => this.handleSaveError(err),
      });
    } else {
      const patient = this.selectedPatient();
      if (!patient) {
        this.formError.set('Selecciona un paciente.');
        this.saving.set(false);
        return;
      }

      this.appointmentService
        .create({ patientId: patient.id, serviceId, date, startTime, notes: this.notes() || null })
        .subscribe({
          next: () => {
            this.saving.set(false);
            this.closeModal();
            this.showFeedback('Cita creada correctamente.');
            this.loadMonth();
          },
          error: (err: HttpErrorResponse) => this.handleSaveError(err),
        });
    }
  }

  private handleSaveError(err: HttpErrorResponse): void {
    const body = err.error as ApiErrorResponse | undefined;
    this.formError.set(body?.message ?? 'No se pudo guardar la cita.');
    this.saving.set(false);
  }

  private showFeedback(message: string): void {
    this.feedback.set(message);
    setTimeout(() => this.feedback.set(null), 3000);
  }

  private toISO(date: Date): string {
    return date.toISOString().substring(0, 10);
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