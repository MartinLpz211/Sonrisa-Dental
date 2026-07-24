import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * Placeholder genérico para las secciones del admin que todavía no
 * se construyen en este paso (Pacientes, Servicios, Citas, etc.).
 * El título se pasa por `data.title` en la ruta, así no necesitamos
 * un componente distinto por cada módulo pendiente.
 */
@Component({
  selector: 'app-coming-soon',
  standalone: true,
  template: `
    <div class="coming-soon">
      <span class="coming-soon__icon">🚧</span>
      <h1>{{ title }}</h1>
      <p>Este módulo se construye en el siguiente paso.</p>
    </div>
  `,
  styles: [`
    .coming-soon {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 4rem 1.5rem;
      color: var(--color-gray-text);
    }
    .coming-soon__icon { font-size: 2.5rem; margin-bottom: 1rem; }
    h1 { font-family: var(--font-display); color: var(--color-dark); margin-bottom: 0.5rem; }
  `],
})
export class ComingSoonComponent {
  readonly title: string;

  constructor(route: ActivatedRoute) {
    this.title = (route.snapshot.data['title'] as string) ?? 'Próximamente';
  }
}
