import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleName } from '../interfaces/user.interface';

/**
 * Protege rutas que requieren sesión iniciada. Si además la ruta trae
 * data: { roles: ['ADMIN'] }, también valida que el rol del usuario
 * esté en esa lista (así reutilizamos un solo guard para /admin y
 * /paciente en vez de duplicar lógica).
 *
 * Uso:
 *   { path: 'admin', canActivate: [authGuard], data: { roles: ['ADMIN'] }, ... }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  const allowedRoles = route.data['roles'] as RoleName[] | undefined;
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = authService.getCurrentUser()?.role.name;
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Autenticado pero sin permiso: lo mandamos a su propio panel.
      return router.createUrlTree([authService.getHomeRouteForRole(userRole)]);
    }
  }

  return true;
};
