import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * El header/footer público ya se renderizan en AppComponent (ver
 * ROUTES_WITHOUT_PUBLIC_CHROME): este layout NO los duplica, solo
 * envuelve las pantallas del paciente para que todas compartan el
 * mismo fondo y el espacio necesario para el header fijo.
 */
@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="patient-shell">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .patient-shell {
      min-height: calc(100vh - 300px);
      background: var(--color-white);
    }
  `],
})
export class PatientLayoutComponent {}
