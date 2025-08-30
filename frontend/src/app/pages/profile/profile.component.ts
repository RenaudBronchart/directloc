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
import { BookingModel } from '../../models/booking.model';
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
  /** Current authenticated user (can be null briefly on bootstrap) */
  private auth = inject(AuthService);
  user$ = this.auth.currentUser$();

  /** Current user's bookings, normalized to an empty array on error */
  private bookingSvc = inject(BookingService);
  bookings$: Observable<BookingModel[]> = this.bookingSvc.my().pipe(
    map(list => list ?? []),
    catchError(() => of([]))
  );

  /** Navigate to a booking detail */
  private router = inject(Router);
  goToBooking(id: number) {
    this.router.navigate(['/bookings', id]);
  }
}
