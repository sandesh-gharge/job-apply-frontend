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
  const backendBase = environment.backendAiApiURL.replace(/\/$/, '');
  const isBackendRequest =
    req.url.startsWith(environment.backendAiApiURL) ||
    req.url.startsWith(backendBase);

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
      if (error.status === 401 && !isRefreshRequest) {
        const refreshToken =
          sessionStorage.getItem('refresh_token');

        console.warn(
          '[AuthInterceptor] Caught 401 Unauthorized for URL:',
          req.url,
          refreshToken ? 'Found refresh_token, initiating token refresh...' : 'No refresh_token found in storage!'
        );

        if (refreshToken) {
          return authService.refreshToken().pipe(
            switchMap((tokens) => {
              console.log('[AuthInterceptor] Refresh successful. Retrying original request.');
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${tokens.access_token}`,
                },
              });
              return next(retryReq);
            }),
            catchError((refreshError) => {
              console.error('[AuthInterceptor] Refresh token endpoint returned an error. Clearing session.', refreshError);
              sessionStorage.clear();
              window.location.href = '/login';
              return throwError(() => refreshError);
            })
          );
        }
      }
      return throwError(() => error);
    })
  );
};
