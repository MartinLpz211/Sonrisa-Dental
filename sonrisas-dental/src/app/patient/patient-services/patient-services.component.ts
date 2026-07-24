import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ServiceService } from '../../services/service.service';
import { Service } from '../../interfaces/service.interface';
import { Appointment } from '../../interfaces/appointment.interface';
import { PatientBookComponent } from '../patient-book/patient-book.component';

@Component({
  selector: 'app-patient-services',
  standalone: true,
  imports: [CommonModule, PatientBookComponent],
  templateUrl: './patient-services.component.html',
  styleUrls: ['./patient-services.component.css'],
})
export class PatientServicesComponent implements OnInit {
  private readonly serviceService = inject(ServiceService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly services = signal<Service[]>([]);
  readonly selectedService = signal<Service | null>(null);
  readonly confirmation = signal<Appointment | null>(null);

  ngOnInit(): void {
    this.serviceService.getAll({ isActive: true }).subscribe({
      next: (res) => {
        this.services.set(res.services);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openBooking(service: Service): void {
    this.selectedService.set(service);
  }

  closeBooking(): void {
    this.selectedService.set(null);
  }

  onBooked(appointment: Appointment): void {
    this.selectedService.set(null);
    this.confirmation.set(appointment);
  }

  goToAppointments(): void {
    this.router.navigateByUrl('/paciente/citas');
  }
}
