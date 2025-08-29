// src/app/guards/no-auth.guard.ts
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Blocks access to public auth pages (login/register) if the user is already authenticated.
 * If authenticated, redirects to the "redirect" query param (if present) or to "/home".
 */
@Injectable({ providedIn: 'root' })
export class NoAuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    if (!this.auth.isAuthenticated()) return true;

    // Prefer a redirect param if present (e.g., when user returns from a protected page),
    // otherwise send them to the home page.
    const redirect = route.queryParams['redirect'];
    return redirect
      ? this.router.parseUrl(redirect)
      : this.router.createUrlTree(['/home']);
  }
}
