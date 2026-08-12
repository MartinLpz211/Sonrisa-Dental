import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.production';

export interface ClinicSettings {
  id: number;
  name: string;
  phone: string;
  address: string;
  openingHours: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/settings`;

  getSettings(): Observable<ClinicSettings> {
    return this.http.get<ClinicSettings>(this.apiUrl);
  }

  updateSettings(data: any): Observable<ClinicSettings> {
    return this.http.put<ClinicSettings>(this.apiUrl, data);
  }
}
