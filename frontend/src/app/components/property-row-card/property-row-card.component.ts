import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PropertyModel } from '../../models/property.model';

/** Allow optional extras without forcing a global model change */
type WithExtras = PropertyModel & {
  currency?: string | null;
  city?: string | null;
  region?: string | null;
};

@Component({
  selector: 'app-property-row-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './property-row-card.component.html',
  styleUrls: ['./property-row-card.component.scss']
})
export class PropertyRowCardComponent {
  @Input() data!: WithExtras;
  @Input() loading = false;
  @Output() open = new EventEmitter<string>();

  placeholder = 'assets/placeholder.webp';

  constructor(private router: Router) {}

  /** Currency from data, fallback to EUR to keep legacy behavior */
  get currencyCode(): string {
    return (this.data?.currency || 'EUR').toUpperCase();
  }

  /** Prefer "City, Region" when available; fallback to legacy `location` */
  get displayLocation(): string {
    const city = this.data?.city?.trim();
    const region = this.data?.region?.trim();
    if (city && region) return `${city}, ${region}`;
    if (city) return city;
    if (region) return region as string;
    return this.data?.location || '';
  }

  /** Nicer badge text */
  get guestsBadge(): string {
    const n = this.data?.maxGuests ?? 0;
    if (n <= 0) return '';
    return n === 1 ? '1 guest' : `Up to ${n} guests`;
  }

  go() {
    if (!this.loading) {
      this.open.emit(this.data.id);
      this.router.navigate(['/properties', this.data.id], {
        queryParamsHandling: 'preserve'
      });
    }
  }
}
