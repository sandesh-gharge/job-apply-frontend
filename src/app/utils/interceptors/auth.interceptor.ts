import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '@env/environment';

/**
 * Attaches a Bearer token to every outgoing request targeting the backend API.
 * Automatically attempts to refresh the access token via refresh_token when a 401 is encountered.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const isBackendRequest = req.url.startsWith(environment.backendAiApiURL);

  if (!isBackendRequest) {
    return next(req);
  }

  const isRefreshRequest = req.url.includes('auth/refresh');
  const token = sessionStorage.getItem('access_token');

  let authReq = req;
  if (token && !isRefreshRequest) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        !isRefreshRequest &&
        sessionStorage.getItem('refresh_token')
      ) {
        return authService.refreshToken().pipe(
          switchMap((tokens) => {
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${tokens.access_token}`,
              },
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
