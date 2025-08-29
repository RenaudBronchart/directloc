import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map, switchMap } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import { BookingService } from '../../services/booking.service';
import { BookingModel } from '../../models/booking.model'; // <-- use shared model
import { BookingCardComponent } from '../../components/booking-card/booking-card.component';

type Vm = BookingModel & {
  nights: number;
  totalNum: number;
  perNight: number | null;
};

/** Parse a 'YYYY-MM-DD' string to a Date in UTC to avoid TZ off-by-one */
function ymdToUtcDate(ymd: string): Date {
  // Expect 'YYYY-MM-DD'
  const [y, m, d] = ymd.split('-').map(n => parseInt(n, 10));
  // Date.UTC uses month 0-based
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

@Component({
  standalone: true,
  selector: 'app-booking-detail',
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatIconModule, MatButtonModule, MatDividerModule,
    DatePipe, CurrencyPipe,
    BookingCardComponent
  ],
  templateUrl: './booking-detail.component.html',
  styleUrls: ['./booking-detail.component.scss']
})
export class BookingDetailComponent {
  private route = inject(ActivatedRoute);
  private bookingSvc = inject(BookingService);

  vm$ = this.route.paramMap.pipe(
    map(p => p.get('id')!),
    switchMap(id => this.bookingSvc.getById(id)),
    map((b): Vm => {
      // Compute nights safely in UTC to prevent timezone drift
      const ci = ymdToUtcDate(b.checkIn);
      const co = ymdToUtcDate(b.checkOut);
      const ms = co.getTime() - ci.getTime();
      const nights = Math.max(1, Math.round(ms / 86400000));

      // totalPrice should already be number in BookingModel; keep a guard anyway
      const totalNum = typeof (b as any).totalPrice === 'string'
        ? Number((b as any).totalPrice)
        : (b.totalPrice ?? 0);

      const perNight = nights ? totalNum / nights : null;
      return { ...b, nights, totalNum, perNight };
    })
  );
}
