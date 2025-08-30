import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map, switchMap } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { BookingService } from '../../services/booking.service';
import { BookingModel } from '../../models/booking.model';
import { BookingCardComponent } from '../../components/booking-card/booking-card.component';
import { MessagingService } from '../../services/messaging.service';

type Vm = BookingModel & {
  nights: number;
  totalNum: number;
  perNight: number | null;
};

/** Parse 'YYYY-MM-DD' as UTC to avoid TZ drift */
function ymdToUtcDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(n => parseInt(n, 10));
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

@Component({
  standalone: true,
  selector: 'app-booking-detail',
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatIconModule, MatButtonModule, MatDividerModule,
    MatSnackBarModule,            // 👈 añadir
    DatePipe, CurrencyPipe,
    BookingCardComponent
  ],
  templateUrl: './booking-detail.component.html',
  styleUrls: ['./booking-detail.component.scss']
})
export class BookingDetailComponent {
  private route = inject(ActivatedRoute);
  private bookingSvc = inject(BookingService);
  private messaging = inject(MessagingService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);

  vm$ = this.route.paramMap.pipe(
    map(p => p.get('id')!),
    switchMap(id => this.bookingSvc.getById(id)),
    map((b): Vm => {
      const ci = ymdToUtcDate(b.checkIn);
      const co = ymdToUtcDate(b.checkOut);
      const ms = co.getTime() - ci.getTime();
      const nights = Math.max(1, Math.round(ms / 86400000));

      const totalNum = typeof (b as any).totalPrice === 'string'
        ? Number((b as any).totalPrice)
        : (b.totalPrice ?? 0);

      const perNight = nights ? totalNum / nights : null;
      return { ...b, nights, totalNum, perNight };
    })
  );

  /** Open/Reuse booking-scoped conversation and navigate to it */
  openBookingChat(bookingId: number): void {
    if (!bookingId) return;
    this.messaging.openForBooking(bookingId).subscribe({
      next: c => this.router.navigate(['/messages', c.id]),
      error: () => this.snack.open('Could not open conversation', 'Close', { duration: 2500 })
    });
  }
}
