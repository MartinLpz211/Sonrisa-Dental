import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  /**
   * Los enlaces de "Navegación" apuntan a secciones (#inicio,
   * #servicios...) que solo existen en la landing ('/'). Si el
   * usuario los clickea desde otra página (p. ej. /legal o /paciente),
   * primero navegamos a inicio y, ya ahí, hacemos scroll a la sección.
   */
  scrollTo(id: string): void {
    if (this.router.url === '/') {
      this.scrollToElement(id);
      return;
    }

    this.router.navigateByUrl('/').then(() => {
      // Espera a que la landing termine de renderizar antes de buscar el elemento.
      setTimeout(() => this.scrollToElement(id), 100);
    });
  }

  private scrollToElement(id: string): void {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
