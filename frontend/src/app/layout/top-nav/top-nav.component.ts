import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [
    MatToolbarModule, MatIconModule, MatMenuModule, MatButtonModule, MatDividerModule,
    RouterLink, NgIf
  ],
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent {
  constructor(public auth: AuthService, private router: Router) {}

  get isLoggedIn(): boolean { return this.auth.isAuthenticated(); }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  goCreate() {
    this.router.navigate([ this.isLoggedIn ? '/properties/create' : '/login' ], {
      queryParams: this.isLoggedIn ? {} : { redirect: '/properties/create' }
    });
  }
}
