// src/app/interceptors/auth.interceptor.ts
// Attaches the JWT to API calls and handles 401/403 globally.
// It avoids sending Authorization on public GETs to prevent CORS preflights.

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';

// ---- Helpers ---------------------------------------------------------------

// Normalize a URL: remove duplicate slashes after the host and trailing slashes.
function norm(u: string): string {
  // collapse multiple slashes after protocol/host, keep "http://"
  u = u.replace(/(^https?:\/\/[^/]+)\/+/, '$1/');
  // collapse any remaining "////"
  u = u.replace(/\/{2,}/g, '/');
  // do not force trailing slash here
  return u;
}

// Base without trailing slash
const API_BASE = norm((environment.apiBase || 'http://localhost:8080').replace(/\/+$/, ''));

// Detects whether a URL targets our API (absolute or proxied /api/…)
function isApiUrl(url: string): boolean {
  url = norm(url);
  return url.startsWith(API_BASE) || url.startsWith('/api/');
}

// Public endpoints that should NEVER carry Authorization (no preflight wanted)
function isPublicNoAuth(url: string, method: string): boolean {
  url = norm(url);

  // Normalize to path-only to simplify checks
  const pathOnly = url.startsWith(API_BASE)
    ? url.substring(API_BASE.length)
    : url;

  // Public GETs (listing, detail, files). IMPORTANT: keep "/my" excluded.
  if (method === 'GET') {
    if (pathOnly.startsWith('/api/properties') && !pathOnly.startsWith('/api/properties/my')) {
      return true;
    }
    if (pathOnly.startsWith('/uploads/')) {
      return true;
    }
  }

  // Public auth endpoints (any method)
  if (pathOnly === '/api/auth/login' || pathOnly === '/api/auth/register') {
    return true;
  }

  return false;
}

// ---- Interceptor -----------------------------------------------------------

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token') || undefined;

  // Decide whether to attach Authorization
  const skipAuth = isPublicNoAuth(req.url, req.method);
  const shouldAttach = token && isApiUrl(req.url) && !skipAuth;

  const authedReq = shouldAttach
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  const router = inject(Router);
  const snack  = inject(MatSnackBar);

  return next(authedReq).pipe(
    catchError((err: HttpErrorResponse) => {
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
