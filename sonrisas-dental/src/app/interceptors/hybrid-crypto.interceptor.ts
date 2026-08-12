import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { HybridCryptoService } from '../services/hybrid-crypto.service';
import { shouldEncryptRequest } from './hybrid-crypto.config';

/**
 * Interceptor de cifrado híbrido — capa ADICIONAL sobre HTTPS/TLS, no
 * un reemplazo. Contraparte de `hybridCrypto.middleware.js` en el
 * backend.
 *
 * Solo actúa sobre los endpoints listados en `ENCRYPTED_ENDPOINTS`
 * (ver hybrid-crypto.config.ts). Para cualquier otra petición, es
 * transparente: no toca el body ni la respuesta, para no romper nada
 * fuera del alcance de esta fase.
 *
 * Flujo para una petición que sí debe cifrarse:
 *   1. Cifra `req.body` → obtiene el envelope + la CryptoKey de sesión.
 *   2. Clona la request con ese envelope como body.
 *   3. Si la respuesta exitosa viene cifrada, la descifra con la misma
 *      CryptoKey y entrega el body en claro al resto de la app (los
 *      componentes/servicios no necesitan saber que hubo cifrado).
 *   4. Si la respuesta es un ERROR (4xx/5xx) y también viene cifrada
 *      (el backend cifra igual los errores de un request cifrado),
 *      se descifra el body del error antes de propagarlo, para que
 *      los mensajes de validación sigan siendo legibles.
 */
export const hybridCryptoInterceptor: HttpInterceptorFn = (req, next) => {
  if (!shouldEncryptRequest(req.method, req.url)) {
    return next(req);
  }

  const cryptoSvc = inject(HybridCryptoService);

  return from(cryptoSvc.encryptRequest(req.body)).pipe(
    switchMap(({ envelope, sessionKey }) => {
      const encryptedReq = req.clone({ body: envelope });

      return next(encryptedReq).pipe(
        switchMap((event) => {
          if (event instanceof HttpResponse && cryptoSvc.isEncryptedResponseEnvelope(event.body)) {
            return from(cryptoSvc.decryptResponse(event.body, sessionKey)).pipe(
              switchMap((decryptedBody) => of(event.clone({ body: decryptedBody })))
            );
          }
          return of(event);
        }),
        catchError((err: unknown) => {
          if (
            err instanceof HttpErrorResponse &&
            cryptoSvc.isEncryptedResponseEnvelope(err.error)
          ) {
            return from(cryptoSvc.decryptResponse(err.error, sessionKey)).pipe(
              switchMap((decryptedError) =>
                throwError(
                  () =>
                    new HttpErrorResponse({
                      error: decryptedError,
                      headers: err.headers,
                      status: err.status,
                      statusText: err.statusText,
                      url: err.url ?? undefined,
                    })
                )
              ),
              // Si el propio descifrado del error falla, no ocultamos
              // el error original — lo relanzamos tal cual llegó.
              catchError(() => throwError(() => err))
            );
          }
          return throwError(() => err);
        })
      );
    })
  );
};
