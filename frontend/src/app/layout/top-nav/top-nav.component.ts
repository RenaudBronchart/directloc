// Top navigation with inbox badge polling.
// Requires MessagingService.unreadCount() -> GET /api/messages/unread-count.

import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule }    from '@angular/material/icon';
import { MatMenuModule }    from '@angular/material/menu';
import { MatButtonModule }  from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule }   from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

import { distinctUntilChanged } from 'rxjs/operators';
import { timer, switchMap, catchError, of, shareReplay } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { MessagingService } from '../../services/messaging.service';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule, MatIconModule, MatMenuModule, MatButtonModule,
    MatDividerModule, MatBadgeModule, MatTooltipModule
  ],
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent {
  private auth = inject(AuthService);
  private messaging = inject(MessagingService);
  readonly router = inject(Router);

  get isLoggedIn(): boolean { return this.auth.isAuthenticated(); }

  // Unread cada 15s
  unread$ = timer(0, 15000).pipe(
    switchMap(() => this.isLoggedIn ? this.messaging.unreadCount() : of(0)),
    catchError(() => of(0)),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  goInbox() {
    if (this.isLoggedIn) {
      this.router.navigate(['/messages']);
    } else {
      this.router.navigate(['/login'], { queryParams: { redirect: '/messages' } });
    }
  }

  goCreate() {
    const target = '/properties/create';
    if (this.isLoggedIn) {
      this.router.navigate([target]);
    } else {
      this.router.navigate(['/login'], { queryParams: { redirect: target } });
    }
  }

  /** Navega al calendario; si ya estás ahí, fuerza recarga del componente. */
  openCalendar() {
    if (this.router.url.startsWith('/calendar')) {
      // Forzar recarga del mismo path (sin ensuciar el history)
      this.router.navigateByUrl('/', { skipLocationChange: true })
        .then(() => this.router.navigate(['/calendar']));
    } else {
      this.router.navigate(['/calendar']);
    }
  }
}
