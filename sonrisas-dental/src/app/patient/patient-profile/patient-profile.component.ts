import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.css'],
})
export class PatientProfileComponent {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);

  readonly user = this.authService.currentUser;
  readonly editing = signal(false);
  readonly changingPassword = signal(false);
  readonly savingProfile = signal(false);
  readonly savingPassword = signal(false);
  readonly message = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  readonly initials = () => {
    const u = this.user();
    if (!u) return '';
    return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();
  };

  profileForm = this.fb.group({
    firstName: [this.user()?.firstName || '', Validators.required],
    lastName: [this.user()?.lastName || '', Validators.required],
    phone: [this.user()?.phone || ''],
    birthDate: [this.formatDateInput(this.user()?.birthDate)],
  });

  securityForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  private formatDateInput(value: string | null | undefined): string {
    return value ? new Date(value).toISOString().split('T')[0] : '';
  }

  startEditing(): void {
    this.editing.set(true);
  }

  cancelEditing(): void {
    const u = this.user();
    this.profileForm.reset({
      firstName: u?.firstName || '',
      lastName: u?.lastName || '',
      phone: u?.phone || '',
      birthDate: this.formatDateInput(u?.birthDate),
    });
    this.editing.set(false);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.savingProfile.set(true);
    this.userService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.savingProfile.set(false);
        this.editing.set(false);
        this.showMessage('success', 'Perfil actualizado correctamente.');
      },
      error: () => {
        this.savingProfile.set(false);
        this.showMessage('error', 'No se pudo actualizar el perfil.');
      },
    });
  }

  togglePasswordForm(): void {
    this.changingPassword.update((v) => !v);
    this.securityForm.reset();
  }

  savePassword(): void {
    if (this.securityForm.invalid) return;
    this.savingPassword.set(true);
    this.userService.changePassword(this.securityForm.value).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.changingPassword.set(false);
        this.securityForm.reset();
        this.showMessage('success', 'Contraseña actualizada correctamente.');
      },
      error: (err) => {
        this.savingPassword.set(false);
        this.showMessage('error', err.error?.message || 'No se pudo cambiar la contraseña.');
      },
    });
  }

  private showMessage(type: 'success' | 'error', text: string): void {
    this.message.set({ type, text });
    setTimeout(() => this.message.set(null), 3500);
  }
}
