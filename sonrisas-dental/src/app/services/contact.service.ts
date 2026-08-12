import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../interfaces/auth.interface';

export interface ContactMessagePayload {
  name: string;
  email: string;
  message: string;
}

export interface ContactMessage extends ContactMessagePayload {
  id: number;
  read: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly apiUrl = `${environment.apiUrl}/contact`;

  constructor(private http: HttpClient) {}

  /** Envía el formulario público de Contacto de la landing. */
  send(payload: ContactMessagePayload): Observable<ContactMessage> {
    return this.http
      .post<ApiResponse<{ contactMessage: ContactMessage }>>(this.apiUrl, payload)
      .pipe(map((res) => res.data.contactMessage));
  }
}
