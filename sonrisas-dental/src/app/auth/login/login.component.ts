import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiErrorResponse } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  /** A dónde volver tras el login, si vino de una ruta protegida */
  private returnUrl: string | null = this.route.snapshot.queryParamMap.get('returnUrl');

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: ({ user }) => {
        this.loading.set(false);
        const destino = this.returnUrl || this.authService.getHomeRouteForRole(user.role.name);
        this.router.navigateByUrl(destino);
      },
      error: (err: { error?: ApiErrorResponse }) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'No se pudo iniciar sesión. Intenta de nuevo.');
      },
    });
  }

  get email() {
    return this.form.controls.email;
  }
  get password() {
    return this.form.controls.password;
  }
}
