import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface PropertyCardData {
  id: string;
  title: string;
  /** Either pass city/region (preferred) or fallback to location */
  location: string;
  pricePerNight: number;
  coverUrl?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  maxGuests?: number | null;

  /** New: currency code from backend (‘EUR’, ‘USD’...). Defaults to ‘EUR’. */
  currency?: string | null;

  /** Optional: if your UI model exposes these, we display them instead of `location`. */
  city?: string | null;
  region?: string | null;
}

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './property-card.component.html',
  styleUrls: ['./property-card.component.scss']
})
export class PropertyCardComponent {
  @Input() data!: PropertyCardData;
  @Input() loading = false;
  @Input() dense = false;

  /** 🔸 Nuevo: modo propietario para mostrar Edit/Delete dentro de la card */
  @Input() ownerMode = false;

  @Output() open = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();

  @HostBinding('class.dense') get isDense() { return this.dense; }

  /** Use provided currency or default to EUR to keep legacy behavior. */
  get currencyCode(): string {
    return (this.data?.currency || 'EUR').toUpperCase();
  }

  /** Prefer "City, Region" if present; fallback to the old `location` string. */
  get displayLocation(): string {
    const city = this.data?.city?.trim();
    const region = this.data?.region?.trim();
    if (city && region) return `${city}, ${region}`;
    if (city) return city;
    if (region) return region as string;
    return this.data?.location || '';
  }

  /** Badge text with proper pluralization. */
  get guestsBadge(): string {
    const n = this.data?.maxGuests ?? 0;
    if (n <= 0) return '';
    return n === 1 ? '1 guest' : `Up to ${n} guests`;
  }

  openCard() {
    if (!this.loading && this.data?.id) this.open.emit(this.data.id);
  }
}
