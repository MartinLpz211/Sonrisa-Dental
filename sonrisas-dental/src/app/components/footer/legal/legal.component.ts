import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type LegalSection = 'terminos' | 'privacidad' | 'arco';

/**
 * Página hermana de la landing, enlazada desde el footer.
 * Reutiliza los mismos tokens visuales (section-label/title/subtitle
 * globales, tarjetas, sombras, radios) para que se sienta parte del
 * mismo sitio, tal como el resto del proyecto.
 */
@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.css'],
})
export class LegalComponent {
  readonly active = signal<LegalSection>('terminos');

  readonly sections: { id: LegalSection; label: string }[] = [
    { id: 'terminos', label: 'Términos y condiciones' },
    { id: 'privacidad', label: 'Aviso de privacidad' },
    { id: 'arco', label: 'Derechos ARCO' },
  ];

  show(section: LegalSection): void {
    this.active.set(section);
    // En móvil, al cambiar de pestaña llevamos el scroll al inicio del contenido.
    document.getElementById('legal-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
