import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../interfaces/auth.interface';
import { DashboardStats } from '../interfaces/dashboard.interface';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  /**
   * Trae en una sola llamada todo lo que necesita el Dashboard
   * principal: totales, servicios más solicitados, próximas citas,
   * últimos pacientes y la serie mensual para la gráfica.
   */
  getStats(): Observable<DashboardStats> {
    return this.http
      .get<ApiResponse<DashboardStats>>(`${this.apiUrl}/stats`)
      .pipe(map((res) => res.data));
  }
}
