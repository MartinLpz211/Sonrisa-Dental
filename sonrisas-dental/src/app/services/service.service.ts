import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../interfaces/auth.interface';
import {
  CreateServicePayload,
  Service,
  ServicesListResponse,
  ServicesQuery,
  UpdateServicePayload,
} from '../interfaces/service.interface';

@Injectable({ providedIn: 'root' })
export class ServiceService {
  private readonly apiUrl = `${environment.apiUrl}/services`;

  constructor(private http: HttpClient) {}

  getAll(query: ServicesQuery): Observable<ServicesListResponse> {
    let params = new HttpParams();
    if (query.search) params = params.set('search', query.search);
    if (query.isActive !== undefined) params = params.set('isActive', String(query.isActive));
    if (query.page) params = params.set('page', String(query.page));
    if (query.limit) params = params.set('limit', String(query.limit));

    return this.http
      .get<ApiResponse<ServicesListResponse>>(this.apiUrl, { params })
      .pipe(map((res) => res.data));
  }

  getById(id: number): Observable<Service> {
    return this.http
      .get<ApiResponse<{ service: Service }>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.data.service));
  }

  create(payload: CreateServicePayload): Observable<Service> {
    return this.http
      .post<ApiResponse<{ service: Service }>>(this.apiUrl, payload)
      .pipe(map((res) => res.data.service));
  }

  update(id: number, payload: UpdateServicePayload): Observable<Service> {
    return this.http
      .patch<ApiResponse<{ service: Service }>>(`${this.apiUrl}/${id}`, payload)
      .pipe(map((res) => res.data.service));
  }

  deactivate(id: number): Observable<Service> {
    return this.http
      .patch<ApiResponse<{ service: Service }>>(`${this.apiUrl}/${id}/deactivate`, {})
      .pipe(map((res) => res.data.service));
  }

  reactivate(id: number): Observable<Service> {
    return this.http
      .patch<ApiResponse<{ service: Service }>>(`${this.apiUrl}/${id}/reactivate`, {})
      .pipe(map((res) => res.data.service));
  }
}
