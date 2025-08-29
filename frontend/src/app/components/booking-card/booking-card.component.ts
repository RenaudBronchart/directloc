import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type BookingStatus = 'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';

export interface BookingCardData {
  id: number;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyCoverUrl?: string | null;
  checkIn: string;   // yyyy-MM-dd
  checkOut: string;  // yyyy-MM-dd
  adults: number;
  children: number;
  rooms: number;
  totalPrice: string | number;
  status: BookingStatus;         // <-- new vocabulary
}

@Component({
  standalone: true,
  selector: 'app-booking-card',
  imports: [CommonModule, MatIconModule, DatePipe, CurrencyPipe],
  templateUrl: './booking-card.component.html',
  styleUrls: ['./booking-card.component.scss']
})
export class BookingCardComponent {
  @Input() data!: BookingCardData;
  @Input() clickable = true;
  @Output() open = new EventEmitter<number>();

  // class for the chip (requested|accepted|declined|cancelled)
  get statusClass(): string {
    return (this.data?.status ?? '').toLowerCase();
  }

  // pretty label (optional)
  statusLabel: Record<BookingStatus, string> = {
    REQUESTED: 'Requested',
    ACCEPTED:  'Accepted',
    DECLINED:  'Declined',
    CANCELLED: 'Cancelled'
  };

  get totalNum(): number {
    const v = this.data?.totalPrice as any;
    return typeof v === 'string' ? Number(v) : (v ?? 0);
  }

  openCard() {
    if (this.clickable) this.open.emit(this.data.id);
  }
}
