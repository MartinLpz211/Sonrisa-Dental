import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { ServiceService } from '../../services/service.service';
import {
  CreateServicePayload,
  Service,
  ServicesPagination,
  UpdateServicePayload,
} from '../../interfaces/service.interface';
import { ApiErrorResponse } from '../../interfaces/auth.interface';
import { HttpErrorResponse } from '@angular/common/http';

type StatusFilter = 'all' | 'active' | 'inactive';
type ModalMode = 'create' | 'edit' | null;

const PAGE_SIZE = 10;

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css'],
})
export class AdminServicesComponent implements OnInit {
  readonly services = signal<Service[]>([]);
  readonly pagination = signal<ServicesPagination | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<StatusFilter>('all');
  readonly page = signal(1);

  /** null = modal cerrado; 'create' = alta nueva; 'edit' = edición de un servicio existente */
  readonly modalMode = signal<ModalMode>(null);
  /** Servicio que se está editando (solo aplica cuando modalMode === 'edit') */
  readonly editingService = signal<Service | null>(null);
  readonly serviceForm: FormGroup;
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  /** Id del servicio sobre el que hay una acción de activar/desactivar en curso */
  readonly togglingId = signal<number | null>(null);

  /** Mensaje breve de confirmación tras una acción exitosa */
  readonly feedback = signal<string | null>(null);

  private readonly search$ = new Subject<string>();

  constructor(private serviceService: ServiceService, private fb: FormBuilder) {
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      price: [null, [Validators.required, Validators.min(0)]],
      duration: [null, [Validators.required, Validators.min(1)]],
      imageUrl: [''],
    });
  }

  ngOnInit(): void {
    this.search$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => this.page.set(1)),
        switchMap(() => this.fetchServices())
      )
      .subscribe();

    this.loadServices();
  }

  // ---------------------------------------------------------------
  // Carga de datos
  // ---------------------------------------------------------------

  loadServices(): void {
    this.fetchServices().subscribe();
  }

  private fetchServices() {
    this.loading.set(true);
    this.error.set(null);

    const isActive =
      this.statusFilter() === 'all' ? undefined : this.statusFilter() === 'active';

    return this.serviceService
      .getAll({
        search: this.searchTerm() || undefined,
        isActive,
        page: this.page(),
        limit: PAGE_SIZE,
      })
      .pipe(
        tap({
          next: (res) => {
            this.services.set(res.services);
            this.pagination.set(res.pagination);
            this.loading.set(false);
          },
          error: () => {
            this.error.set('No se pudo cargar la lista de servicios.');
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
    this.loadServices();
  }

  goToPage(newPage: number): void {
    const total = this.pagination()?.totalPages ?? 1;
    if (newPage < 1 || newPage > total) return;
    this.page.set(newPage);
    this.loadServices();
  }

  // ---------------------------------------------------------------
  // Crear / Editar (mismo modal y formulario)
  // ---------------------------------------------------------------

  openCreate(): void {
    this.formError.set(null);
    this.editingService.set(null);
    this.serviceForm.reset({ name: '', description: '', price: null, duration: null, imageUrl: '' });
    this.modalMode.set('create');
  }

  openEdit(service: Service): void {
    this.formError.set(null);
    this.editingService.set(service);
    this.serviceForm.reset({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      imageUrl: service.imageUrl ?? '',
    });
    this.modalMode.set('edit');
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.editingService.set(null);
  }

  save(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    const raw = this.serviceForm.value;
    this.saving.set(true);
    this.formError.set(null);

    if (this.modalMode() === 'edit') {
      const service = this.editingService();
      if (!service) return;

      const payload: UpdateServicePayload = {
        name: raw.name,
        description: raw.description,
        price: raw.price,
        duration: raw.duration,
        imageUrl: raw.imageUrl || null,
      };

      this.serviceService.update(service.id, payload).subscribe({
        next: (updated) => {
          this.services.update((list) => list.map((s) => (s.id === updated.id ? updated : s)));
          this.saving.set(false);
          this.closeModal();
          this.showFeedback('Servicio actualizado correctamente.');
        },
        error: (err: HttpErrorResponse) => this.handleSaveError(err),
      });
    } else {
      const payload: CreateServicePayload = {
        name: raw.name,
        description: raw.description,
        price: raw.price,
        duration: raw.duration,
        imageUrl: raw.imageUrl || null,
      };

      this.serviceService.create(payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.showFeedback('Servicio creado correctamente.');
          // Volvemos a la página 1 para asegurarnos de ver el servicio recién creado
          this.page.set(1);
          this.loadServices();
        },
        error: (err: HttpErrorResponse) => this.handleSaveError(err),
      });
    }
  }

  private handleSaveError(err: HttpErrorResponse): void {
    const body = err.error as ApiErrorResponse | undefined;
    this.formError.set(body?.message ?? 'No se pudo guardar el servicio.');
    this.saving.set(false);
  }

  // ---------------------------------------------------------------
  // Activar / desactivar
  // ---------------------------------------------------------------

  toggleActive(service: Service): void {
    const action = service.isActive ? 'desactivar' : 'reactivar';
    if (!confirm(`¿Seguro que quieres ${action} "${service.name}"?`)) {
      return;
    }

    this.togglingId.set(service.id);
    const request$ = service.isActive
      ? this.serviceService.deactivate(service.id)
      : this.serviceService.reactivate(service.id);

    request$.subscribe({
      next: (updated) => {
        this.services.update((list) => list.map((s) => (s.id === updated.id ? updated : s)));
        this.togglingId.set(null);
        this.showFeedback(updated.isActive ? 'Servicio reactivado.' : 'Servicio desactivado.');
      },
      error: () => {
        this.togglingId.set(null);
        this.error.set(`No se pudo ${action} el servicio.`);
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

  formatPrice(price: number): string {
    return price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  }

  formatDuration(minutes: number): string {
    return `${minutes} min`;
  }
}
