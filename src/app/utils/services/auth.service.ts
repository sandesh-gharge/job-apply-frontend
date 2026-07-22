import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProfileInfo } from '@app/utils/entities/user';
import { firstValueFrom, Observable, of, map, catchError, throwError, shareReplay, tap, finalize } from 'rxjs';
import { environment } from '@env/environment';

export type Role = 'admin' | 'user' | 'guest';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);
  private refreshToken$?: Observable<{ access_token: string; refresh_token: string }>;

  login(email: string, password: string) {
    return this.http.post<{
      access_token: string;
      refresh_token: string;
      user: { id: string; email: string; };
      profile_info: ProfileInfo;
    }>(`${environment.backendAiApiURL}auth/login`, {
      email,
      password
    });
  }

  signUp(email: string, password: string) {
    return this.http.post<any>(`${environment.backendAiApiURL}auth/signup`, {
      email,
      password
    });
  }

  refreshToken(): Observable<{ access_token: string; refresh_token: string }> {
    const refreshToken = sessionStorage.getItem('refresh_token');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    if (this.refreshToken$) {
      return this.refreshToken$;
    }

    this.refreshToken$ = this.http
      .post<{ access_token: string; refresh_token: string }>(
        `${environment.backendAiApiURL}auth/refresh`,
        { refresh_token: refreshToken }
      )
      .pipe(
        tap((response) => {
          if (response?.access_token) {
            sessionStorage.setItem('access_token', response.access_token);
          }
          if (response?.refresh_token) {
            sessionStorage.setItem('refresh_token', response.refresh_token);
          }
        }),
        finalize(() => {
          this.refreshToken$ = undefined;
        }),
        shareReplay(1)
      );

    return this.refreshToken$;
  }

  logout() {
    const token = sessionStorage.getItem('access_token') || '';
    return this.http.post<any>(`${environment.backendAiApiURL}auth/logout`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  /**
   * Returns a Promise that resolves to the same shape as the old Supabase
   * getSession() for backward compatibility with BackendApiService and auth effects:
   * { data: { session: { access_token, user: { id, email } } | null } }
   */
  getSession(): Promise<{ data: { session: { access_token: string; user: { id: string; email: string } } | null } }> {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      return Promise.resolve({ data: { session: null } });
    }
    return firstValueFrom(
      this.http.get<any>(`${environment.backendAiApiURL}auth/session`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).pipe(
        map(response => ({
          data: {
            session: response?.session ?? response ?? null
          }
        })),
        catchError(() => of({ data: { session: null } }))
      )
    );
  }

  async isLoggedIn(): Promise<boolean> {
    const { data } = await this.getSession();
    return !!data.session;
  }

  /**
   * Token-based check replacement for the old Supabase onAuthStateChange.
   * Immediately invokes the callback with the current auth state.
   */
  onAuthStateChange(callback: any) {
    const token = sessionStorage.getItem('access_token');
    const event = token ? 'SIGNED_IN' : 'SIGNED_OUT';
    callback(event, token ? { access_token: token } : null);
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  setPassword(newPassword: string): Observable<any> {
    const token = sessionStorage.getItem('access_token') || '';
    return this.http.post<any>(`${environment.backendAiApiURL}auth/set-password`, {
      new_password: newPassword
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}
