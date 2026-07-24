import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../interfaces/auth.interface';
import {
  Appointment,
  AppointmentsListResponse,
  AppointmentsQuery,
  AvailabilityQuery,
  AvailabilityResponse,
  CreateAppointmentPayload,
  RescheduleAppointmentPayload,
} from '../interfaces/appointment.interface';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  getAll(query: AppointmentsQuery): Observable<AppointmentsListResponse> {
    let params = new HttpParams();
    if (query.search) params = params.set('search', query.search);
    if (query.serviceId) params = params.set('serviceId', String(query.serviceId));
    if (query.status) params = params.set('status', query.status);
    if (query.date) params = params.set('date', query.date);
    if (query.dateFrom) params = params.set('dateFrom', query.dateFrom);
    if (query.dateTo) params = params.set('dateTo', query.dateTo);
    if (query.page) params = params.set('page', String(query.page));
    if (query.limit) params = params.set('limit', String(query.limit));

    return this.http
      .get<ApiResponse<AppointmentsListResponse>>(this.apiUrl, { params })
      .pipe(map((res) => res.data));
  }

  getAvailability(query: AvailabilityQuery): Observable<AvailabilityResponse> {
    let params = new HttpParams().set('date', query.date).set('serviceId', String(query.serviceId));
    if (query.excludeAppointmentId) {
      params = params.set('excludeAppointmentId', String(query.excludeAppointmentId));
    }

    return this.http
      .get<ApiResponse<AvailabilityResponse>>(`${this.apiUrl}/availability`, { params })
      .pipe(map((res) => res.data));
  }

  create(payload: CreateAppointmentPayload): Observable<Appointment> {
    return this.http
      .post<ApiResponse<{ appointment: Appointment }>>(this.apiUrl, payload)
      .pipe(map((res) => res.data.appointment));
  }

  reschedule(id: number, payload: RescheduleAppointmentPayload): Observable<Appointment> {
    return this.http
      .patch<ApiResponse<{ appointment: Appointment }>>(`${this.apiUrl}/${id}/reschedule`, payload)
      .pipe(map((res) => res.data.appointment));
  }

  // ==========================================
  // FUNCIONES PARA PACIENTES (RUTAS /me)
  // ==========================================

  getMyAppointments(): Observable<AppointmentsListResponse> {
    return this.http
      .get<ApiResponse<AppointmentsListResponse>>(`${this.apiUrl}/me`)
      .pipe(map((res) => res.data));
  }

  createMyAppointment(payload: CreateAppointmentPayload): Observable<Appointment> {
    return this.http
      .post<ApiResponse<{ appointment: Appointment }>>(`${this.apiUrl}/me`, payload)
      .pipe(map((res) => res.data.appointment));
  }

  rescheduleMyAppointment(id: number, payload: RescheduleAppointmentPayload): Observable<Appointment> {
    return this.http
      .patch<ApiResponse<{ appointment: Appointment }>>(`${this.apiUrl}/me/${id}/reschedule`, payload)
      .pipe(map((res) => res.data.appointment));
  }

  cancelMyAppointment(id: number): Observable<Appointment> {
    return this.http
      .patch<ApiResponse<{ appointment: Appointment }>>(`${this.apiUrl}/me/${id}/cancel`, {})
      .pipe(map((res) => res.data.appointment));
  }

  updateMyNotes(id: number, notes: string): Observable<Appointment> {
    return this.http
      .patch<ApiResponse<{ appointment: Appointment }>>(`${this.apiUrl}/me/${id}/notes`, { notes })
      .pipe(map((res) => res.data.appointment));
  }
}