import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map, switchMap } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import { BookingService } from '../../services/booking.service';
import { Booking } from '../../types/booking';
import { BookingCardComponent } from '../../components/booking-card/booking-card.component';

type Vm = Booking & {
  nights: number;
  totalNum: number;
  perNight: number | null;
};

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
      const nights = Math.max(
        1,
        Math.round((Date.parse(b.checkOut as any) - Date.parse(b.checkIn as any)) / 86400000)
      );
      const totalNum = typeof b.totalPrice === 'string'
        ? Number(b.totalPrice)
        : (b.totalPrice as unknown as number);
      const perNight = nights ? totalNum / nights : null;
      return { ...b, nights, totalNum, perNight };
    })
  );
}
