import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../interfaces/appointment.interface';
import { PatientBookComponent } from '../patient-book/patient-book.component';
import { isAppointmentEditable, statusClass, statusLabel } from '../shared/status.util';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [CommonModule, RouterLink, PatientBookComponent],
  templateUrl: './patient-appointments.component.html',
  styleUrls: ['./patient-appointments.component.css'],
})
export class PatientAppointmentsComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly appointments = signal<Appointment[]>([]);
  readonly rescheduling = signal<Appointment | null>(null);
  readonly message = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  readonly statusLabel = statusLabel;
  readonly statusClass = statusClass;
  readonly isEditable = isAppointmentEditable;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.appointmentService.getMyAppointments().subscribe({
      next: (res) => {
        // Más recientes primero
        const sorted = [...res.appointments].sort((a, b) =>
          `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`)
        );
        this.appointments.set(sorted);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  viewDetail(id: number): void {
    this.router.navigateByUrl(`/paciente/citas/${id}`);
  }

  openReschedule(apt: Appointment): void {
    this.rescheduling.set(apt);
  }

  closeReschedule(): void {
    this.rescheduling.set(null);
  }

  onRescheduled(): void {
    this.rescheduling.set(null);
    this.showMessage('success', 'Cita reagendada correctamente.');
    this.load();
  }

  cancelAppointment(apt: Appointment): void {
    if (!confirm('¿Estás seguro de que quieres cancelar esta cita?')) return;
    this.appointmentService.cancelMyAppointment(apt.id).subscribe({
      next: () => {
        this.showMessage('success', 'Cita cancelada.');
        this.load();
      },
      error: () => this.showMessage('error', 'No se pudo cancelar la cita.'),
    });
  }

  private showMessage(type: 'success' | 'error', text: string): void {
    this.message.set({ type, text });
    setTimeout(() => this.message.set(null), 3500);
  }
}
