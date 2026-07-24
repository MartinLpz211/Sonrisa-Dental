import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../interfaces/user.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/users`;

  updateProfile(data: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, data).pipe(
      tap((updatedUser) => {
        // Update user in AuthService if needed
        this.authService.updateCurrentUser(updatedUser);
      })
    );
  }

  updatePreferences(data: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/preferences`, data).pipe(
      tap((updatedUser) => {
        this.authService.updateCurrentUser(updatedUser);
      })
    );
  }

  changePassword(data: any): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/password`, data);
  }
}
