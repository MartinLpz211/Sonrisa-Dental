/**
 * Endpoints cuyo body se cifra con el interceptor de cifrado híbrido.
 *
 * IMPORTANTE: esta lista debe mantenerse en sincronía con los
 * endpoints que en el backend tienen `decryptPayload`/`encryptResponse`
 * (ver backend/src/routes/*.routes.js). Agregar aquí un endpoint sin
 * que el backend lo soporte todavía ROMPERÍA ese endpoint (el backend
 * recibiría el envelope cifrado como si fuera el body real y fallaría
 * la validación).
 *
 * Estado actual (FASE 3 backend + FASE 4 frontend):
 *   - POST /auth/login    ✅ cifrado en ambos lados
 *   - POST /auth/register ✅ cifrado en ambos lados
 *
 * Pendiente para un incremento futuro coordinado (backend + frontend
 * a la vez): perfil (/auth/me), notas de citas, pagos.
 */
export interface EncryptedEndpointRule {
  method: 'POST' | 'PUT' | 'PATCH';
  /** Sufijo de la URL (relativo a environment.apiUrl) que identifica el endpoint. */
  pathSuffix: string;
}

export const ENCRYPTED_ENDPOINTS: EncryptedEndpointRule[] = [
  { method: 'POST', pathSuffix: '/auth/login' },
  { method: 'POST', pathSuffix: '/auth/register' },
];

/** Determina si una request dada debe cifrarse según la lista anterior. */
export function shouldEncryptRequest(method: string, url: string): boolean {
  return ENCRYPTED_ENDPOINTS.some(
    (rule) => rule.method === method && url.endsWith(rule.pathSuffix)
  );
}
