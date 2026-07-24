import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { SettingsService, ClinicSettings } from '../../services/settings.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css']
})
export class AdminSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private settingsService = inject(SettingsService);
  private authService = inject(AuthService);

  activeTab: 'profile' | 'security' | 'preferences' | 'clinic' = 'profile';

  profileForm!: FormGroup;
  securityForm!: FormGroup;
  preferencesForm!: FormGroup;
  clinicForm!: FormGroup;

  message: { type: 'success' | 'error', text: string } | null = null;

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();

    this.profileForm = this.fb.group({
      firstName: [user?.firstName || '', Validators.required],
      lastName: [user?.lastName || '', Validators.required],
      phone: [user?.phone || ''],
      birthDate: [user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '']
    });

    this.securityForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.preferencesForm = this.fb.group({
      language: [user?.language || 'es', Validators.required],
      notificationsEnabled: [user?.notificationsEnabled ?? true]
    });

    this.clinicForm = this.fb.group({
      name: ['', Validators.required],
      phone: [''],
      address: [''],
      openingHours: ['']
    });

    this.loadClinicSettings();
  }

  loadClinicSettings(): void {
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        if (settings) {
          this.clinicForm.patchValue({
            name: settings.name,
            phone: settings.phone,
            address: settings.address,
            openingHours: settings.openingHours
          });
        }
      },
      error: (err) => console.error('Error loading clinic settings', err)
    });
  }

  setTab(tab: 'profile' | 'security' | 'preferences' | 'clinic'): void {
    this.activeTab = tab;
    this.message = null;
  }

  showMessage(type: 'success' | 'error', text: string): void {
    this.message = { type, text };
    setTimeout(() => this.message = null, 3000);
  }

  onProfileSubmit(): void {
    if (this.profileForm.invalid) return;
    this.userService.updateProfile(this.profileForm.value).subscribe({
      next: () => this.showMessage('success', 'Perfil actualizado correctamente.'),
      error: () => this.showMessage('error', 'Error al actualizar el perfil.')
    });
  }

  onSecuritySubmit(): void {
    if (this.securityForm.invalid) return;
    this.userService.changePassword(this.securityForm.value).subscribe({
      next: () => {
        this.showMessage('success', 'Contraseña actualizada correctamente.');
        this.securityForm.reset();
      },
      error: (err) => this.showMessage('error', err.error.message || 'Error al cambiar contraseña.')
    });
  }

  onPreferencesSubmit(): void {
    if (this.preferencesForm.invalid) return;
    this.userService.updatePreferences(this.preferencesForm.value).subscribe({
      next: () => this.showMessage('success', 'Preferencias actualizadas correctamente.'),
      error: () => this.showMessage('error', 'Error al actualizar preferencias.')
    });
  }

  onClinicSubmit(): void {
    if (this.clinicForm.invalid) return;
    this.settingsService.updateSettings(this.clinicForm.value).subscribe({
      next: () => this.showMessage('success', 'Ajustes de la clínica actualizados.'),
      error: () => this.showMessage('error', 'Error al actualizar ajustes de clínica.')
    });
  }
}
