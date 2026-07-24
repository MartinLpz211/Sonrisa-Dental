import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../interfaces/appointment.interface';
import { statusClass, statusLabel } from '../shared/status.util';

@Component({
  selector: 'app-patient-appointment-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './patient-appointment-detail.component.html',
  styleUrls: ['./patient-appointment-detail.component.css'],
})
export class PatientAppointmentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly appointmentService = inject(AppointmentService);
  private readonly authService = inject(AuthService);

  readonly user = this.authService.currentUser;
  readonly loading = signal(true);
  readonly appointment = signal<Appointment | null>(null);
  readonly notFound = signal(false);

  readonly statusLabel = statusLabel;
  readonly statusClass = statusClass;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // No existe un GET /me/:id dedicado; como la lista de "mis citas"
    // ya trae todo lo necesario, la reutilizamos para el detalle en
    // vez de pedirle al backend un endpoint nuevo solo para esto.
    this.appointmentService.getMyAppointments().subscribe({
      next: (res) => {
        const found = res.appointments.find((a) => a.id === id) ?? null;
        this.appointment.set(found);
        this.notFound.set(!found);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notFound.set(true);
      },
    });
  }

  goBack(): void {
    this.router.navigateByUrl('/paciente/citas');
  }
}
