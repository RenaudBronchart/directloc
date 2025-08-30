// Top navigation with inbox badge polling.
// Requires MessagingService.unreadCount() -> GET /api/messages/unread-count.

import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // NgIf + AsyncPipe

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule }    from '@angular/material/icon';
import { MatMenuModule }    from '@angular/material/menu';
import { MatButtonModule }  from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule }   from '@angular/material/badge';

import { timer, switchMap, catchError, of, shareReplay } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { MessagingService } from '../../services/messaging.service';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule, MatIconModule, MatMenuModule, MatButtonModule, MatDividerModule, MatBadgeModule
  ],
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent {
  private auth = inject(AuthService);
  private messaging = inject(MessagingService);
  private router = inject(Router);

  // Simple auth getter (reads token state from your AuthService)
  get isLoggedIn(): boolean { return this.auth.isAuthenticated(); }

  // Poll unread count every 15s (and at init). Returns 0 when logged out or on error.
  unread$ = timer(0, 15000).pipe(
    switchMap(() => this.isLoggedIn ? this.messaging.unreadCount() : of(0)),
    catchError(() => of(0)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  goCreate() {
    const target = '/properties/create';
    if (this.isLoggedIn) {
      this.router.navigate([target]);
    } else {
      this.router.navigate(['/login'], { queryParams: { redirect: target } });
    }
  }
}
