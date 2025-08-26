// src/app/pages/profile/profile.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../types/booking';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  // Auth / usuario actual
  private auth = inject(AuthService);
  user$ = this.auth.currentUser$();

  // Reservas del usuario
  private bookingSvc = inject(BookingService);
  bookings$: Observable<Booking[]> = this.bookingSvc.my().pipe(
    map(list => list ?? []),
    catchError(() => of([])) // si hay error, devolvemos lista vacía (evita romper la UI)
  );

  // Helper para fechas legibles en el template
  toDateLabel(d: string): string {
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d;
    }
  }



}
