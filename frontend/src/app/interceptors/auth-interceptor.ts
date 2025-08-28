// src/app/interceptors/auth-interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

const API_BASE = 'http://localhost:8080/';
const PUBLIC_ROUTES = ['/api/auth/login', '/api/auth/register'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token') || undefined;

  const isApi = req.url.startsWith(API_BASE);
  const isPublic = PUBLIC_ROUTES.some(r => req.url.includes(r));


  const authedReq =
    token && isApi && !isPublic
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  const router = inject(Router);
  const snack  = inject(MatSnackBar);

  return next(authedReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (isApi && err.status === 401) {
        snack.open('Your session is invalid. Please sign in again.', 'Close', { duration: 3500 });
        router.navigate(['/login'], { queryParams: { redirect: router.url || '/' } });
      } else if (isApi && err.status === 403) {
        const msg = typeof err.error === 'string'
          ? err.error
          : (err.error?.message || err.error?.error || err.error?.detail) || 'Access denied.';
        snack.open(msg, 'Close', { duration: 3500 });
      }
      return throwError(() => err);
    })
  );
};
