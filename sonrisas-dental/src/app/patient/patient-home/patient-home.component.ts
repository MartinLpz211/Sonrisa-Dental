import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../interfaces/appointment.interface';

@Component({
  selector: 'app-patient-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-home.component.html',
  styleUrls: ['./patient-home.component.css'],
})
export class PatientHomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly router = inject(Router);

  readonly user = this.authService.currentUser;
  readonly loading = signal(true);
  readonly appointments = signal<Appointment[]>([]);

  /** Próxima cita activa (pendiente, confirmada o reagendada), ordenada por fecha/hora. */
  readonly nextAppointment = computed<Appointment | null>(() => {
    const activeStatuses = new Set(['PENDIENTE', 'CONFIRMADA', 'REAGENDADA']);
    const upcoming = this.appointments()
      .filter((a) => activeStatuses.has(a.status))
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
    return upcoming[0] ?? null;
  });

  readonly totalAppointments = computed(() => this.appointments().length);

  readonly completedCount = computed(
    () => this.appointments().filter((a) => a.status === 'COMPLETADA').length
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

  goTo(path: string): void {
    this.router.navigateByUrl(path);
  }
}
