import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

/**
 * El header/footer del sitio público (marketing) no tiene sentido
 * dentro de /admin: esa sección tiene su propio layout (ver
 * AdminLayoutComponent). El módulo de Paciente, en cambio, SÍ debe
 * conservar el header/footer público (mismo header, con el menú
 * cambiado por sesión) para que el paciente sienta que nunca salió
 * del sitio. Por eso /paciente ya no está en esta lista.
 */
const ROUTES_WITHOUT_PUBLIC_CHROME = ['/admin'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    @if (showPublicChrome()) {
      <app-header></app-header>
    }
    <main>
      <router-outlet></router-outlet>
    </main>
    @if (showPublicChrome()) {
      <app-footer></app-footer>
    }
  `,
  styles: [`
    main { display: block; }
  `],
})
export class AppComponent {
  readonly showPublicChrome = signal(true);

  constructor(private router: Router) {
    this.updateChromeVisibility(this.router.url);

    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      this.updateChromeVisibility((e as NavigationEnd).urlAfterRedirects);
    });
  }

  private updateChromeVisibility(url: string): void {
    this.showPublicChrome.set(
      !ROUTES_WITHOUT_PUBLIC_CHROME.some((prefix) => url.startsWith(prefix))
    );
  }
}
