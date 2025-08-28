import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../types/booking';
import { BookingCardComponent } from '../../components/booking-card/booking-card.component';

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
    MatProgressBarModule,
    BookingCardComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  // Usuario autenticado
  private auth = inject(AuthService);
  user$ = this.auth.currentUser$();

  // Reservas del usuario
  private bookingSvc = inject(BookingService);
  bookings$: Observable<Booking[]> = this.bookingSvc.my().pipe(
    map(list => list ?? []),
    catchError(() => of([])) // silencio errores en la UI
  );

  // Navegación al detalle
  private router = inject(Router);
  goToBooking(id: number) {
    this.router.navigate(['/bookings', id]);
  }
}
