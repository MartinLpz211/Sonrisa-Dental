import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, RoleName } from '../interfaces/user.interface';
import {
  LoginPayload,
  RegisterPayload,
  AuthData,
  ApiResponse,
} from '../interfaces/auth.interface';

const TOKEN_KEY = 'sonrisas_token';
const USER_KEY = 'sonrisas_user';

/**
 * Maneja la sesión del usuario: login, registro, logout y el estado
 * reactivo del usuario autenticado.
 *
 * Nota sobre almacenamiento del JWT: como el backend valida el token
 * vía header "Authorization: Bearer <token>" (no cookies), la única
 * opción viable en un SPA es guardarlo en el cliente. Usamos
 * localStorage para que la sesión sobreviva a cerrar la pestaña.
 * Esto implica el riesgo estándar de XSS-en-localStorage; se mitiga
 * evitando inyectar HTML no confiable en la app (sin innerHTML con
 * datos externos, sin libs no auditadas, etc.). Si más adelante se
 * quiere subir el nivel de seguridad, la alternativa es mover el
 * token a una cookie httpOnly, lo cual requeriría cambios en el backend.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  /** Señal privada con el usuario actual (null = no autenticado) */
  private readonly _currentUser = signal<User | null>(this.readUserFromStorage());

  /** Expuesta de solo lectura para el resto de la app */
  readonly currentUser = this._currentUser.asReadonly();

  /** Derivadas útiles para templates y guards */
  readonly isLoggedIn = computed(() => this._currentUser() !== null);
  readonly role = computed<RoleName | null>(() => this._currentUser()?.role.name ?? null);

  constructor(private http: HttpClient) {}

  // ---------------------------------------------------------------
  // Acciones contra la API
  // ---------------------------------------------------------------

  login(payload: LoginPayload): Observable<AuthData> {
    return this.http.post<ApiResponse<AuthData>>(`${this.apiUrl}/login`, payload).pipe(
      tap(({ data }) => this.setSession(data)),
      map((res) => res.data)
    );
  }

  register(payload: RegisterPayload): Observable<AuthData> {
    return this.http.post<ApiResponse<AuthData>>(`${this.apiUrl}/register`, payload).pipe(
      tap(({ data }) => this.setSession(data)),
      map((res) => res.data)
    );
  }

  /**
   * Cierra sesión en el backend (blacklistea el token) y siempre
   * limpia el estado local, incluso si la petición al servidor falla
   * (p. ej. sin conexión): el usuario no debe quedar "atascado" logueado.
   */
  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of(void 0);
      })
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<ApiResponse<{ user: User }>>(`${this.apiUrl}/me`).pipe(
      tap(({ data }) => this._currentUser.set(data.user)),
      map((res) => res.data.user),
      catchError((err) => {
        // Si el token ya no es válido, limpiamos la sesión local.
        this.clearSession();
        return throwError(() => err);
      })
    );
  }

  // ---------------------------------------------------------------
  // Helpers de estado
  // ---------------------------------------------------------------

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this._currentUser();
  }

  /** Ruta del panel según el rol; útil para redirecciones post-login */
  getHomeRouteForRole(roleName: RoleName | undefined): string {
    return roleName === 'ADMIN' ? '/admin' : '/paciente';
  }

  private setSession(data: AuthData): void {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    this._currentUser.set(data.user);
  }

  updateCurrentUser(user: User): void {
    const current = this._currentUser();
    if (current) {
      const updatedUser = { ...current, ...user };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      this._currentUser.set(updatedUser);
    }
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
  }

  private readUserFromStorage(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
