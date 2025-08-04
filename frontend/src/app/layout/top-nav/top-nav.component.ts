import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule],
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent {
  email: string | null = null;

  constructor(public authService: AuthService) {
    this.setEmailFromToken();
  }

  logout(): void {
    this.authService.logout();
  }

  private setEmailFromToken(): void {
    const token = this.authService.getToken();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.email = payload.sub; // or payload.email, depending on backend
    } catch (err) {
      console.error('Error decoding token', err);
    }
  }
}

