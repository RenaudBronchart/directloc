import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    NgIf,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent {
  searchTerm = '';

  constructor(public auth: AuthService, private router: Router) {}

  // --- Getters utilisés dans le template ---
  get isLoggedIn(): boolean {
    return this.auth.isAuthenticated();
  }

  get username(): string {
    const email = this.auth.currentUser?.email;
    return email ? email.split('@')[0] : 'Account';
  }

  // --- Actions ---
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  search() {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/properties'], {
        queryParams: { q: this.searchTerm }
      });
    }
  }
}
