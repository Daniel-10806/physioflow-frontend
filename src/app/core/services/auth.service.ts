import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'physioflow_token';

  constructor(private http: HttpClient) { }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/login`,
      data
    ).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);

        const payload = JSON.parse(atob(response.token.split('.')[1]));
        localStorage.setItem('physio_user_name', payload.sub);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  register(data: any) {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/register`,
      data
    ).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);

        const payload = JSON.parse(atob(response.token.split('.')[1]));

        localStorage.setItem('physio_user_name', payload.sub);
        localStorage.setItem('physio_user_gender', payload.gender);
      })
    );
  }


}