import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { PatientService } from '../../services/patient.service';
import { Patient, PatientsPagination, UpdatePatientPayload } from '../../interfaces/patient.interface';
import { ApiErrorResponse } from '../../interfaces/auth.interface';
import { HttpErrorResponse } from '@angular/common/http';

type StatusFilter = 'all' | 'active' | 'inactive';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css'],
})
export class PatientsComponent implements OnInit {
  readonly patients = signal<Patient[]>([]);
  readonly pagination = signal<PatientsPagination | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<StatusFilter>('all');
  readonly page = signal(1);

  /** Paciente que se está editando actualmente (null = modal cerrado) */
  readonly editingPatient = signal<Patient | null>(null);
  readonly editForm: FormGroup;
  readonly saving = signal(false);
  readonly editError = signal<string | null>(null);

  /** Id del paciente sobre el que hay una acción de activar/desactivar en curso */
  readonly togglingId = signal<number | null>(null);

  /** Mensaje breve de confirmación tras una acción exitosa */
  readonly feedback = signal<string | null>(null);

  private readonly search$ = new Subject<string>();

  constructor(private patientService: PatientService, private fb: FormBuilder) {
    this.editForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      birthDate: [''],
    });
  }

  ngOnInit(): void {
    this.search$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => this.page.set(1)),
        switchMap(() => this.fetchPatients())
      )
      .subscribe();

    this.loadPatients();
  }

  // ---------------------------------------------------------------
  // Carga de datos
  // ---------------------------------------------------------------

  loadPatients(): void {
    this.fetchPatients().subscribe();
  }

  private fetchPatients() {
    this.loading.set(true);
    this.error.set(null);

    const isActive =
      this.statusFilter() === 'all' ? undefined : this.statusFilter() === 'active';

    return this.patientService
      .getAll({
        search: this.searchTerm() || undefined,
        isActive,
        page: this.page(),
        limit: PAGE_SIZE,
      })
      .pipe(
        tap({
          next: (res) => {
            this.patients.set(res.patients);
            this.pagination.set(res.pagination);
            this.loading.set(false);
          },
          error: () => {
            this.error.set('No se pudo cargar la lista de pacientes.');
            this.loading.set(false);
          },
        })
      );
  }

  // ---------------------------------------------------------------
  // Búsqueda, filtro y paginación
  // ---------------------------------------------------------------

  onSearchInput(value: string): void {
    this.searchTerm.set(value);
    this.search$.next(value);
  }

  onStatusFilterChange(value: StatusFilter): void {
    this.statusFilter.set(value);
    this.page.set(1);
    this.loadPatients();
  }

  goToPage(newPage: number): void {
    const total = this.pagination()?.totalPages ?? 1;
    if (newPage < 1 || newPage > total) return;
    this.page.set(newPage);
    this.loadPatients();
  }

  // ---------------------------------------------------------------
  // Edición
  // ---------------------------------------------------------------

  openEdit(patient: Patient): void {
    this.editError.set(null);
    this.editingPatient.set(patient);
    this.editForm.reset({
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone ?? '',
      birthDate: patient.birthDate ? patient.birthDate.substring(0, 10) : '',
    });
  }

  closeEdit(): void {
    this.editingPatient.set(null);
  }

  saveEdit(): void {
    const patient = this.editingPatient();
    if (!patient || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const raw = this.editForm.value;
    const payload: UpdatePatientPayload = {
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      phone: raw.phone || null,
      birthDate: raw.birthDate || null,
    };

    this.saving.set(true);
    this.editError.set(null);

    this.patientService.update(patient.id, payload).subscribe({
      next: (updated) => {
        this.patients.update((list) => list.map((p) => (p.id === updated.id ? updated : p)));
        this.saving.set(false);
        this.closeEdit();
        this.showFeedback('Paciente actualizado correctamente.');
      },
      error: (err: HttpErrorResponse) => {
        const body = err.error as ApiErrorResponse | undefined;
        this.editError.set(body?.message ?? 'No se pudo guardar el cambio.');
        this.saving.set(false);
      },
    });
  }

  // ---------------------------------------------------------------
  // Activar / desactivar
  // ---------------------------------------------------------------

  toggleActive(patient: Patient): void {
    const action = patient.isActive ? 'desactivar' : 'reactivar';
    if (!confirm(`¿Seguro que quieres ${action} a ${patient.firstName} ${patient.lastName}?`)) {
      return;
    }

    this.togglingId.set(patient.id);
    const request$ = patient.isActive
      ? this.patientService.deactivate(patient.id)
      : this.patientService.reactivate(patient.id);

    request$.subscribe({
      next: (updated) => {
        this.patients.update((list) => list.map((p) => (p.id === updated.id ? updated : p)));
        this.togglingId.set(null);
        this.showFeedback(
          updated.isActive ? 'Paciente reactivado.' : 'Paciente desactivado.'
        );
      },
      error: () => {
        this.togglingId.set(null);
        this.error.set(`No se pudo ${action} al paciente.`);
      },
    });
  }

  // ---------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------

  private showFeedback(message: string): void {
    this.feedback.set(message);
    setTimeout(() => this.feedback.set(null), 3000);
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: '2-digit' });
  }
}
