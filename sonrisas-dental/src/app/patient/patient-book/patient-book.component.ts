import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment, CreateAppointmentPayload } from '../../interfaces/appointment.interface';

/**
 * Subconjunto mínimo de datos de un servicio que este modal necesita
 * mostrar. Tanto `Service` (interfaces/service.interface.ts) como el
 * `AppointmentService` embebido en una `Appointment` cumplen con esto,
 * así el mismo modal sirve para "Agendar" (desde Servicios) y para
 * "Reagendar" (desde Mis citas) sin duplicar componentes.
 */
export interface BookableService {
  id: number;
  name: string;
  price: number;
  duration: number;
  imageUrl?: string | null;
}

/**
 * Modal de agendado. Se usa tanto para agendar una cita nueva (desde
 * Servicios) como para reagendar una existente (desde Mis citas),
 * pasando `existingAppointmentId`.
 */
@Component({
  selector: 'app-patient-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-book.component.html',
  styleUrls: ['./patient-book.component.css'],
})
export class PatientBookComponent implements OnInit {
  @Input({ required: true }) service!: BookableService;
  @Input() existingAppointmentId: number | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Appointment>();

  private readonly appointmentService = inject(AppointmentService);
  private readonly fb = inject(FormBuilder);

  readonly today = new Date().toISOString().split('T')[0];
  readonly availableSlots = signal<string[]>([]);
  readonly checkingAvailability = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  form = this.fb.group({
    date: ['', Validators.required],
    startTime: ['', Validators.required],
    notes: [''],
  });

  ngOnInit(): void {
    this.form.get('date')!.valueChanges.subscribe(() => this.checkAvailability());
  }

  checkAvailability(): void {
    const date = this.form.get('date')?.value;
    this.form.get('startTime')?.setValue('');
    this.availableSlots.set([]);
    if (!date) return;

    this.checkingAvailability.set(true);
    this.appointmentService
      .getAvailability({
        date,
        serviceId: this.service.id,
        excludeAppointmentId: this.existingAppointmentId ?? undefined,
      })
      .subscribe({
        next: (res) => {
          this.availableSlots.set(res.slots);
          this.checkingAvailability.set(false);
        },
        error: () => {
          this.availableSlots.set([]);
          this.checkingAvailability.set(false);
        },
      });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.errorMessage.set(null);
    this.submitting.set(true);

    const payload: Omit<CreateAppointmentPayload, 'patientId'> = {
      serviceId: this.service.id,
      date: this.form.value.date!,
      startTime: this.form.value.startTime!,
      notes: this.form.value.notes || null,
    };

    const request$ = this.existingAppointmentId
      ? this.appointmentService.rescheduleMyAppointment(this.existingAppointmentId, {
          date: payload.date,
          startTime: payload.startTime,
        })
      : this.appointmentService.createMyAppointment(payload as CreateAppointmentPayload);

    request$.subscribe({
      next: (appointment) => {
        this.submitting.set(false);
        this.saved.emit(appointment);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err.error?.message || 'No se pudo agendar la cita. Intenta de nuevo.');
      },
    });
  }

  close(): void {
    this.closed.emit();
  }
}
