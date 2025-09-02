import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import {
  FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule
} from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import {
  MatDatepickerModule,
  MatDateRangePicker,
  MatCalendarCellClassFunction
} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

import { MessagingService } from '../../../services/messaging.service';
import { PropertyService } from '../../../services/property.service';
import { PropertyDetail } from '../../../models/property.model';
import { AuthService } from '../../../services/auth.service';
import { BookingService } from '../../../services/booking.service';
import { BookingRequest } from '../../../models/booking.model';

import { addDays, format } from 'date-fns';

type DetailForm = {
  checkIn:  FormControl<Date | null>;
  checkOut: FormControl<Date | null>;
  adults:   FormControl<number>;
  children: FormControl<number>;
  rooms:    FormControl<number>;
};

/** URL search params (typed to avoid index-signature errors in template) */
interface SearchQueryParams {
  q?: string;
  region?: string;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  rooms?: number;
  minPrice?: number;
  maxPrice?: number;
  bedroomsMin?: number;
  bathroomsMin?: number;
  guestsMin?: number;
  sortBy?: string;
}

/** Small display helpers */
type MetaItem = { icon: string; label: string; value: string };
type AmenityItem = { icon: string; label: string };

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatIconModule, MatButtonModule, MatDividerModule, MatCardModule,
    MatDatepickerModule, MatNativeDateModule, MatSnackBarModule
  ],
  templateUrl: './property-detail.component.html',
  styleUrls: ['./property-detail.component.scss']
})
export class PropertyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(PropertyService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private router = inject(Router);
  private auth = inject(AuthService);
  private booking = inject(BookingService);
  private messaging = inject(MessagingService);

  @ViewChild('rangePicker') rangePicker!: MatDateRangePicker<Date>;

  property: PropertyDetail | null = null;
  loading = true;
  submitting = false;
  placeholder = 'assets/placeholder.webp';

  errorText: string | null = null;

  /** Derived presentation data */
  metaItems: MetaItem[] = [];
  amenityItems: AmenityItem[] = [];

  /** Current search params mirrored from URL (for “Back to results”). */
  currentSearchParams: SearchQueryParams = {};
  get hasAnyFilter(): boolean {
    const s = this.currentSearchParams;
    return !!(
      s.q || s.region || s.checkIn || s.checkOut ||
      s.adults || s.children || s.rooms ||
      s.minPrice || s.maxPrice || s.bedroomsMin || s.bathroomsMin
    );
  }

  private startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
  today = this.startOfDay(new Date());
  booked = new Set<string>(); // 'yyyy-MM-dd'

  form: FormGroup<DetailForm> = this.fb.group<DetailForm>({
    checkIn:  this.fb.control<Date | null>(null, { validators: Validators.required }),
    checkOut: this.fb.control<Date | null>(null, { validators: Validators.required }),
    adults:   this.fb.control<number>(2, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    children: this.fb.control<number>(0, { nonNullable: true, validators: [Validators.min(0)] }),
    rooms:    this.fb.control<number>(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
  });

  // UI getters
  get a() { return this.form.controls.adults.value ?? 1; }
  get c() { return this.form.controls.children.value ?? 0; }
  get r() { return this.form.controls.rooms.value ?? 1; }
  get guests(): number { return this.a + this.c; }
  get maxGuests(): number { return this.property?.maxGuests ?? Infinity; }

  get nights(): number {
    const ci = this.form.controls.checkIn.value;
    const co = this.form.controls.checkOut.value;
    if (!ci || !co) return 0;
    const ms = this.startOfDay(co).getTime() - this.startOfDay(ci).getTime();
    return Math.max(0, Math.round(ms / 86400000));
  }

  get estTotal(): number | null {
    if (!this.property || this.nights < 1) return null;
    return (this.property.pricePerNight || 0) * this.nights;
  }

  get datesLabel(): string {
    const { checkIn, checkOut } = this.form.value;
    if (checkIn && checkOut) {
      const fmt: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      return `${new Date(checkIn).toLocaleDateString(undefined, fmt)} – ${new Date(checkOut).toLocaleDateString(undefined, fmt)}`;
    }
    return 'Pick dates';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getPropertyById(id).subscribe({
      next: p => {
        this.property = p;
        this.loading = false;

        // Build meta + amenities for display
        this.metaItems = this.buildMeta(p);
        this.amenityItems = this.buildAmenities(p);

        // Prefetch booked days for the next 6 months
        if (p?.id) {
          const from = format(this.today, 'yyyy-MM-dd');
          const to   = format(addDays(this.today, 180), 'yyyy-MM-dd');
          this.booking.getBookedDays(p.id, from, to).subscribe(days => {
            this.booked = new Set(days ?? []);
          });
        }
      },
      error: () => { this.loading = false; }
    });

    // ---- Read query params (for back link + prefill) ----
    const qp = this.route.snapshot.queryParamMap;
    const toNum = (s: string | null) => (s != null ? +s : undefined);

    const sp: SearchQueryParams = {
      q: qp.get('q') || undefined,
      region: qp.get('region') || undefined,
      checkIn: qp.get('checkIn') || undefined,
      checkOut: qp.get('checkOut') || undefined,
      adults: toNum(qp.get('adults')),
      children: toNum(qp.get('children')),
      rooms: toNum(qp.get('rooms')),
      minPrice: toNum(qp.get('minPrice')),
      maxPrice: toNum(qp.get('maxPrice')),
      bedroomsMin: toNum(qp.get('bedroomsMin')),
      bathroomsMin: toNum(qp.get('bathroomsMin')),
      guestsMin: toNum(qp.get('guestsMin')),
      sortBy: qp.get('sortBy') || undefined
    };
    this.currentSearchParams = sp;

    // Prefill booking form
    const toDate = (s: string | null) => s ? new Date(s) : null;
    const today = this.today;
    const tomorrow = addDays(today, 1);

    this.form.patchValue({
      checkIn:  toDate(qp.get('checkIn')) ?? today,
      checkOut: toDate(qp.get('checkOut')) ?? tomorrow,
      adults:   toNum(qp.get('adults')) ?? 2,
      children: toNum(qp.get('children')) ?? 0,
      rooms:    toNum(qp.get('rooms')) ?? 1
    }, { emitEvent: false });
  }

  // Calendar classes/filters
  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    if (view !== 'month') return '';
    const d = this.startOfDay(cellDate);
    const iso = format(d, 'yyyy-MM-dd');
    if (d < this.today) return 'date-past';
    if (this.booked.has(iso)) return 'date-booked';
    return '';
  };
  rangeDateFilter = (d: Date | null): boolean => {
    if (!d) return false;
    const day = this.startOfDay(d);
    const iso = format(day, 'yyyy-MM-dd');
    if (day < this.today) return false;
    if (this.booked.has(iso)) return false;
    return true;
  };

  openDates(): void {
    if (this.rangePicker) this.rangePicker.open();
  }

  openChat(): void {
    if (!this.property) return;
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { redirect: this.router.url }});
      return;
    }
    this.messaging.openGeneral(this.property.id).subscribe({
      next: c => this.router.navigate(['/messages', c.id]),
      error: () => this.snack.open('Could not open conversation', 'Close', { duration: 2500 })
    });
  }

  onDateChanged(): void {
    const ci = this.form.controls.checkIn.value;
    const co = this.form.controls.checkOut.value;
    if (ci && co && co <= ci) {
      const fixed = addDays(this.startOfDay(ci), 1);
      this.form.controls.checkOut.setValue(fixed);
    }
    this.errorText = null;
  }

  private step(ctrl: 'adults'|'children'|'rooms', delta: number): void {
    const c = this.form.controls[ctrl];
    const min = ctrl === 'children' ? 0 : 1;
    c.setValue(Math.max(min, (c.value ?? min) + delta));
  }
  inc(ctrl: 'adults'|'children'|'rooms'): void { this.step(ctrl, +1); }
  dec(ctrl: 'adults'|'children'|'rooms'): void { this.step(ctrl, -1); }

  requestToBook(): void {
    if (!this.property) return;

    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { redirect: this.router.url }});
      return;
    }
    if (this.form.invalid) return;

    if (this.nights < 2) {
      this.errorText = 'Minimum stay is 2 nights.';
      this.snack.open(this.errorText, 'Close', { duration: 3000 });
      return;
    }

    const v = this.form.getRawValue();
    const toYMD = (d: Date) => {
      const x = this.startOfDay(d);
      const y = x.getFullYear();
      const m = String(x.getMonth() + 1).padStart(2, '0');
      const day = String(x.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const payload: BookingRequest = {
      propertyId: this.property.id,
      checkIn:  toYMD(v.checkIn!),
      checkOut: toYMD(v.checkOut!),
      adults:   v.adults!,
      children: v.children!,
      rooms:    v.rooms!,
    };

    this.submitting = true;
    this.errorText = null;

    this.booking.create(payload).subscribe({
      next: (b) => {
        this.submitting = false;
        this.snack.open('Booking requested  ✅', 'Close', { duration: 2500 });
        if (b?.id != null) {
          this.router.navigate(['/bookings', b.id]);
        } else {
          this.router.navigate(['/profile']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        const apiMsg = (err.error && (err.error.message || err.error.error || err.error.detail)) || '';
        if (err.status === 409 || /Dates not available/i.test(apiMsg)) {
          this.errorText = 'These dates are already booked. Please pick different dates.';
        } else if (err.status === 400) {
          if (/Minimum.*2.*night/i.test(apiMsg)) {
            this.errorText = 'Minimum stay is 2 nights.';
          } else if (/after.*check[- ]?in/i.test(apiMsg)) {
            this.errorText = 'Check-out must be after check-in.';
          } else {
            this.errorText = apiMsg || 'Invalid booking data.';
          }
        } else if (err.status === 401) {
          this.errorText = 'Your session expired. Please sign in again.';
        } else if (err.status === 403) {
          this.errorText = apiMsg || 'Could not complete booking.';
        } else {
          this.errorText = apiMsg || 'Booking failed.';
        }
        this.snack.open(this.errorText ?? 'Booking failed.', 'Close', { duration: 3500 });
      }
    });
  }

  /* ------------ helpers to build “everything” sections ------------ */
  private titleize(s?: string | null): string {
    if (!s) return '';
    return s.toString().split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  }

  private buildMeta(p: PropertyDetail): MetaItem[] {
    const out: MetaItem[] = [];
    const add = (label: string, value: string | number | null | undefined, icon = 'info') => {
      if (value !== null && value !== undefined && value !== '') {
        out.push({ icon, label, value: String(value) });
      }
    };

    add('Type', this.titleize(p.propertyType), 'home');
    add('Bedrooms', p.bedrooms, 'bed');
    add('Bathrooms', p.bathrooms, 'bathtub');
    add('Beds', p.beds, 'single_bed');
    add('Max guests', p.maxGuests ? `Up to ${p.maxGuests}` : null, 'group');
    add('Area', p.areaM2 ? `${p.areaM2} m²` : null, 'square_foot');
    add('Minimum nights', p.minNights ? `≥ ${p.minNights}` : null, 'nights_stay');
    add('Wi-Fi', p.wifiMbps != null ? `${p.wifiMbps} Mbps` : null, 'wifi');
    add('View', this.titleize(p.viewType), 'landscape');
    add('To center', p.distanceToCenterKm != null ? `${p.distanceToCenterKm} km` : null, 'location_city');
    add('To beach', p.distanceToBeachKm != null ? `${p.distanceToBeachKm} km` : null, 'beach_access');
    add('Check-in', p.checkInFrom, 'schedule');
    add('Check-out', p.checkOutUntil, 'schedule');

    return out;
  }

  private buildAmenities(p: PropertyDetail): AmenityItem[] {
    const items: AmenityItem[] = [];
    const add = (cond: any, label: string, icon: string) => { if (cond) items.push({ label, icon }); };

    add(p.pool, 'Pool', 'pool');
    add(p.parking, 'Parking', 'local_parking');
    add(p.petFriendly, 'Pet friendly', 'pets');
    add(p.smokingAllowed, 'Smoking allowed', 'smoking_rooms');
    add(p.garden, 'Garden', 'yard');
    add(p.terrace, 'Terrace', 'deck');
    add(p.balcony, 'Balcony', 'balcony');
    add(p.hotTub, 'Hot tub', 'hot_tub');
    add(p.airConditioning, 'Air conditioning', 'ac_unit');
    add(p.heating, 'Heating', 'whatshot');
    add(p.accessible, 'Accessible', 'accessible');
    add(p.workspace, 'Workspace', 'work');


    return items;
  }

  trackMeta = (_: number, m: MetaItem) => m.label;
  trackAmenity = (_: number, a: AmenityItem) => a.label;
}
