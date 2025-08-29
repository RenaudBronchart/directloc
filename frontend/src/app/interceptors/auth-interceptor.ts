// Attaches the JWT to API calls and handles 401/403 globally.
// Uses environment.apiBase so you can switch between dev/prod easily.

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';

const API_BASE = environment.apiBase; // e.g. 'http://localhost:8080/'

// Public endpoints that must NOT carry the Authorization header
const PUBLIC_ROUTES = [
  `${API_BASE}api/auth/login`,
  `${API_BASE}api/auth/register`,
];

// Helper: support both absolute API URLs and a dev proxy (`/api/...`)
function isApiUrl(url: string): boolean {
  return url.startsWith(API_BASE) || url.startsWith('/api/');
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token') || undefined;

  // Do not attach token to public endpoints
  const isPublic = PUBLIC_ROUTES.some(r => req.url.startsWith(r));

  const authedReq =
    token && isApiUrl(req.url) && !isPublic
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  const router = inject(Router);
  const snack  = inject(MatSnackBar);

  return next(authedReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // Only show auth errors for API calls
      if (isApiUrl(req.url) && err.status === 401) {
        snack.open('Your session is invalid. Please sign in again.', 'Close', { duration: 3500 });
        router.navigate(['/login'], { queryParams: { redirect: router.url || '/' } });
      } else if (isApiUrl(req.url) && err.status === 403) {
        const msg = typeof err.error === 'string'
          ? err.error
          : (err.error?.message || err.error?.error || err.error?.detail) || 'Access denied.';
        snack.open(msg, 'Close', { duration: 3500 });
      }
      return throwError(() => err);
    })
  );
};
