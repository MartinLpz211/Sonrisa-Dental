import { Component, HostListener, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  constructor(public authService: AuthService, private router: Router) {}

  /**
   * Con sesión de PACIENTE activa, el header deja de ser el menú de
   * marketing (Inicio/Servicios/Nosotros/Contacto) y muestra la
   * navegación del panel del paciente. El header en sí (logo, estilos,
   * hamburguesa) es exactamente el mismo componente.
   */
  readonly isPatientNav = computed(() => this.authService.role() === 'PACIENTE');

  /** Toggles mobile menu open/closed */
  menuOpen = signal(false);

  /** Adds a scrolled class once user scrolls past 60px */
  private readonly scrolledByPosition = signal(false);

  /**
   * En el módulo del paciente casi ninguna pantalla tiene un hero azul
   * de fondo (solo la de Inicio), así que forzamos el header "sólido"
   * siempre ahí para que el texto no quede blanco-sobre-blanco.
   */
  readonly scrolled = computed(() => this.scrolledByPosition() || this.isPatientNav());

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolledByPosition.set(window.scrollY > 60);
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  /** A dónde debe ir el link "Mi panel" según el rol del usuario logueado */
  get homeRoute(): string {
    return this.authService.getHomeRouteForRole(this.authService.role() ?? undefined);
  }

  /** Smooth-scroll to an anchor and close the mobile menu. Si no estamos
   * en la landing (p. ej. /legal), primero navega a inicio. */
  scrollTo(id: string): void {
    this.closeMenu();

    if (this.router.url === '/') {
      this.scrollToElement(id);
      return;
    }

    this.router.navigateByUrl('/').then(() => {
      setTimeout(() => this.scrollToElement(id), 100);
    });
  }

  private scrollToElement(id: string): void {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  logout(): void {
    this.closeMenu();
    this.authService.logout().subscribe(() => this.router.navigateByUrl('/login'));
  }
}
