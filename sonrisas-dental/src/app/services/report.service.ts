import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../interfaces/auth.interface';
import { ReportsQuery, ReportsSummary } from '../interfaces/report.interface';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getSummary(query: ReportsQuery): Observable<ReportsSummary> {
    const params = new HttpParams().set('dateFrom', query.dateFrom).set('dateTo', query.dateTo);

    return this.http
      .get<ApiResponse<ReportsSummary>>(`${this.apiUrl}/summary`, { params })
      .pipe(map((res) => res.data));
  }
}
