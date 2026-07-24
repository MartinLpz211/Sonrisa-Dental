import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../interfaces/appointment.interface';
import { statusClass, statusLabel } from '../shared/status.util';

@Component({
  selector: 'app-patient-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-history.component.html',
  styleUrls: ['./patient-history.component.css'],
})
export class PatientHistoryComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);

  readonly loading = signal(true);
  readonly appointments = signal<Appointment[]>([]);

  readonly statusLabel = statusLabel;
  readonly statusClass = statusClass;

  /**
   * "Historial" = tratamientos ya finalizados. No existe un endpoint
   * de historial aparte en el backend; se deriva de /appointments/me
   * filtrando por estado COMPLETADA, ordenado del más reciente al más
   * antiguo.
   */
  readonly history = computed(() =>
    this.appointments()
      .filter((a) => a.status === 'COMPLETADA')
      .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`))
  );

  ngOnInit(): void {
    this.appointmentService.getMyAppointments().subscribe({
      next: (res) => {
        this.appointments.set(res.appointments);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
