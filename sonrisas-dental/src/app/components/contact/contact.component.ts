import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent {
  form: ContactForm = { name: '', email: '', message: '' };

  /** 'idle' | 'sending' | 'sent' | 'error' */
  status = signal<'idle' | 'sending' | 'sent' | 'error'>('idle');

  contactInfo = [
    { icon: '📞', label: 'Teléfono',   value: '(442) 130-0183',       href: 'tel:4421300183' },
    { icon: '📧', label: 'Correo',     value: 'contacto@gmail.com',   href: 'mailto:contacto@gmail.com' },
    { icon: '📍', label: 'Dirección',  value: 'Querétaro, México',    href: null },
    { icon: '🕐', label: 'Horario',    value: 'Lun–Sáb: 9am – 7pm',  href: null },
  ];

  onSubmit(): void {
    if (!this.form.name || !this.form.email || !this.form.message) return;

    this.status.set('sending');

    // Simula envío (sin backend)
    setTimeout(() => {
      this.status.set('sent');
      this.form = { name: '', email: '', message: '' };
    }, 1400);
  }

  reset(): void {
    this.status.set('idle');
  }
}
