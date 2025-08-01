import { HttpInterceptorFn } from '@angular/common/http';

const PUBLIC_ROUTES = ['/auth/login', '/auth/register'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  const isPublic = PUBLIC_ROUTES.some(route => req.url.includes(route));

  if (token && !isPublic) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
