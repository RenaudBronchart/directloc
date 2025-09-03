import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  adults?: number | null;
  children?: number | null;
  rooms?: number | null;
  totalPrice: string | number | null;
  currency?: string | null;      // NEW: format currency per booking (default EUR)
  status: BookingStatus;
}

@Component({
  standalone: true,
  selector: 'app-booking-card',
  imports: [CommonModule, MatIconModule],
  templateUrl: './booking-card.component.html',
  styleUrls: ['./booking-card.component.scss']
})
export class BookingCardComponent {
  @Input() data!: BookingCardData;
  @Input() clickable = true;
  @Output() open = new EventEmitter<number>();

  /** Class for the chip (requested|accepted|declined|cancelled). */
  get statusClass(): string {
    return (this.data?.status ?? '').toLowerCase();
  }

  /** Human label for statuses. */
  statusLabel: Record<BookingStatus, string> = {
    REQUESTED: 'Requested',
    ACCEPTED:  'Accepted',
    DECLINED:  'Declined',
    CANCELLED: 'Cancelled'
  };

  /** Show guests row only if at least one value is present. */
  get hasGuests(): boolean {
    return [this.data?.adults, this.data?.children, this.data?.rooms].some(v => v !== null && v !== undefined);
  }

  /** Normalize price to number for CurrencyPipe. */
  get totalNum(): number | null {
    const v = this.data?.totalPrice as any;
    if (v == null) return null;
    return typeof v === 'string' ? Number(v) : v;
  }

  openCard() {
    if (this.clickable) this.open.emit(this.data.id);
  }

  onKeydown(ev: KeyboardEvent) {
    if (!this.clickable) return;
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      this.open.emit(this.data.id);
    }
  }
}
