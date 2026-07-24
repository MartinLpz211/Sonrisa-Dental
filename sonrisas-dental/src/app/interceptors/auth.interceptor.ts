import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor funcional (estilo Angular 15+): agrega automáticamente
 * el header "Authorization: Bearer <token>" a toda petición saliente,
 * siempre que haya un token guardado. Las peticiones a /login y
 * /register simplemente no tienen token todavía, así que no pasa nada
 * si igual entran aquí: el header no se agrega y listo.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authReq);
};
