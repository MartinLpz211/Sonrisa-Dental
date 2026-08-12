import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment.production';
import { ApiResponse } from '../interfaces/auth.interface';
import {
  Patient,
  PatientsListResponse,
  PatientsQuery,
  UpdatePatientPayload,
} from '../interfaces/patient.interface';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly apiUrl = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  getAll(query: PatientsQuery): Observable<PatientsListResponse> {
    let params = new HttpParams();
    if (query.search) params = params.set('search', query.search);
    if (query.isActive !== undefined) params = params.set('isActive', String(query.isActive));
    if (query.page) params = params.set('page', String(query.page));
    if (query.limit) params = params.set('limit', String(query.limit));

    return this.http
      .get<ApiResponse<PatientsListResponse>>(this.apiUrl, { params })
      .pipe(map((res) => res.data));
  }

  getById(id: number): Observable<Patient> {
    return this.http
      .get<ApiResponse<{ patient: Patient }>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.data.patient));
  }

  update(id: number, payload: UpdatePatientPayload): Observable<Patient> {
    return this.http
      .patch<ApiResponse<{ patient: Patient }>>(`${this.apiUrl}/${id}`, payload)
      .pipe(map((res) => res.data.patient));
  }

  deactivate(id: number): Observable<Patient> {
    return this.http
      .patch<ApiResponse<{ patient: Patient }>>(`${this.apiUrl}/${id}/deactivate`, {})
      .pipe(map((res) => res.data.patient));
  }

  reactivate(id: number): Observable<Patient> {
    return this.http
      .patch<ApiResponse<{ patient: Patient }>>(`${this.apiUrl}/${id}/reactivate`, {})
      .pipe(map((res) => res.data.patient));
  }
}
