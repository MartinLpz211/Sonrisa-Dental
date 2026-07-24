import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface MenuItem {
  icon: string;
  label: string;
  path: string;
  /** true solo para el link raíz del dashboard, para no marcarlo activo en /admin/pacientes, etc. */
  exact?: boolean;
}

/**
 * Layout propio del panel de administración: header superior +
 * sidebar fijo (colapsable en móvil) + área de contenido donde se
 * renderizan los módulos hijos vía <router-outlet>.
 *
 * Este layout reemplaza por completo el header/footer del sitio
 * público mientras el usuario está dentro de /admin (ver AppComponent).
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
})
export class AdminLayoutComponent {
  /** Colapsado por defecto en móvil; el CSS decide cuándo importa este estado. */
  readonly sidebarOpen = signal(false);

  /** Simulado por ahora: en el módulo de Reportes/Notificaciones se conectará a datos reales. */
  readonly notificationsCount = signal(3);

  readonly menuItems: MenuItem[] = [
    { icon: '🏠', label: 'Dashboard', path: '/admin', exact: true },
    { icon: '👥', label: 'Pacientes', path: '/admin/pacientes' },
    { icon: '🦷', label: 'Servicios Dentales', path: '/admin/servicios' },
    { icon: '📅', label: 'Citas', path: '/admin/citas' },
    { icon: '📆', label: 'Calendario', path: '/admin/calendario' },
    { icon: '📊', label: 'Reportes', path: '/admin/reportes' },
    { icon: '⚙️', label: 'Configuración', path: '/admin/configuracion' },
  ];

  constructor(public authService: AuthService, private router: Router) {}

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  /** Cierra el sidebar al navegar en móvil, para no tapar el contenido. */
  closeSidebarOnMobileNav(): void {
    if (window.innerWidth < 992) {
      this.sidebarOpen.set(false);
    }
  }

  logout(): void {
    this.authService.logout().subscribe(() => this.router.navigateByUrl('/login'));
  }

  get initials(): string {
    const user = this.authService.currentUser();
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
}
