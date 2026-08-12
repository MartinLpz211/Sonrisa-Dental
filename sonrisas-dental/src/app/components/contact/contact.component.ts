import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment.production';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(ContactService);
  private readonly sanitizer = inject(DomSanitizer);

  /** Reactive Form: nombre y mensaje obligatorios, correo con formato válido. */
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  /** 'idle' | 'sending' | 'sent' | 'error' */
  status = signal<'idle' | 'sending' | 'sent' | 'error'>('idle');
  errorMessage = signal<string>('');

  /** Misma fuente de datos que el Footer, para que nunca queden desincronizados */
  private readonly siteInfo = environment.siteInfo;

  contactInfo = [
    { icon: '📞', label: 'Teléfono',   value: this.siteInfo.phone,   href: this.siteInfo.phoneHref },
    { icon: '📧', label: 'Correo',     value: this.siteInfo.email,   href: `mailto:${this.siteInfo.email}` },
    { icon: '📍', label: 'Dirección',  value: this.siteInfo.address, href: null },
    { icon: '🕐', label: 'Horario',    value: this.siteInfo.openingHours, href: null },
  ];

  /** URL del mapa embebido, generada desde la MISMA dirección que se muestra arriba.
   *  Se marca como segura porque la construimos nosotros mismos a partir de un
   *  valor fijo de configuración (no de input del usuario). */
  readonly mapEmbedUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    `https://maps.google.com/maps?q=${encodeURIComponent(
      this.siteInfo.mapsQuery
    )}&t=&z=16&ie=UTF8&iwloc=&output=embed`
  );

  /** Enlace "Cómo llegar" (abre Google Maps con direcciones hacia el consultorio) */
  readonly directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    this.siteInfo.mapsQuery
  )}`;

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.status.set('sending');
    this.errorMessage.set('');

    this.contactService.send(this.form.getRawValue()).subscribe({
      next: () => {
        this.status.set('sent');
        this.form.reset();
      },
      error: (err) => {
        this.status.set('error');
        this.errorMessage.set(
          err?.error?.message ?? 'No pudimos enviar tu mensaje. Inténtalo de nuevo en unos minutos.'
        );
      },
    });
  }

  reset(): void {
    this.status.set('idle');
  }

  /** Helper para mostrar errores solo cuando el campo fue tocado/enviado. */
  hasError(controlName: 'name' | 'email' | 'message'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }
}
