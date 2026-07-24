import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../interfaces/appointment.interface';

interface PatientNotification {
  id: string;
  icon: string;
  text: string;
  date: string;
}

/**
 * NOTA: el backend todavía no tiene un modelo/endpoint de notificaciones.
 * Mientras se decide si se construye, este centro de notificaciones se
 * deriva en el cliente a partir del estado de las citas del paciente
 * (no persiste nada, no requiere cambios en la API).
 */
@Component({
  selector: 'app-patient-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-notifications.component.html',
  styleUrls: ['./patient-notifications.component.css'],
})
export class PatientNotificationsComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);

  readonly loading = signal(true);
  readonly appointments = signal<Appointment[]>([]);

  readonly notifications = computed<PatientNotification[]>(() => {
    const items: PatientNotification[] = [];
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    for (const apt of this.appointments()) {
      if (apt.status === 'CONFIRMADA') {
        items.push({
          id: `confirmada-${apt.id}`,
          icon: '✅',
          text: `Tu cita de ${apt.service.name} fue confirmada para el ${this.formatDate(apt.date)} a las ${apt.startTime}.`,
          date: apt.updatedAt,
        });
      }
      if (apt.status === 'REAGENDADA') {
        items.push({
          id: `reagendada-${apt.id}`,
          icon: '🔄',
          text: `Tu cita de ${apt.service.name} fue reagendada para el ${this.formatDate(apt.date)} a las ${apt.startTime}.`,
          date: apt.updatedAt,
        });
      }
      if (apt.status === 'CANCELADA') {
        items.push({
          id: `cancelada-${apt.id}`,
          icon: '❌',
          text: `Tu cita de ${apt.service.name} del ${this.formatDate(apt.date)} fue cancelada.`,
          date: apt.updatedAt,
        });
      }
      if (
        apt.date === tomorrowStr &&
        (apt.status === 'PENDIENTE' || apt.status === 'CONFIRMADA' || apt.status === 'REAGENDADA')
      ) {
        items.push({
          id: `recordatorio-${apt.id}`,
          icon: '⏰',
          text: `Recuerda asistir mañana a tu cita de ${apt.service.name} a las ${apt.startTime}.`,
          date: apt.date,
        });
      }
    }

    return items.sort((a, b) => b.date.localeCompare(a.date));
  });

  ngOnInit(): void {
    this.appointmentService.getMyAppointments().subscribe({
      next: (res) => {
        this.appointments.set(res.appointments);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  }
}
