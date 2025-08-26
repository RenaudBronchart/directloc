// src/app/pages/property/property-detail/property-detail.component.ts
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
import { MatDatepickerModule, MatDateRangePicker } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PropertyService } from '../../../services/property.service';
import { PropertyDetail } from '../../../models/property.model';
import { AuthService } from '../../../services/auth.service';

/* ===== Booking ===== */
export interface BookingRequest {
  propertyId: string; // UUID
  checkIn: string;    // yyyy-MM-dd
  checkOut: string;   // yyyy-MM-dd
  adults: number;
  children: number;
  rooms: number;
}
class BookingService {
  private API = 'http://localhost:8080/api';
  constructor(private http: HttpClient, private auth: AuthService) {}
  create(req: BookingRequest): Observable<any> {
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.post(`${this.API}/bookings`, req, { headers });
  }
}
/* ==================== */

/* Strongly typed form */
type DetailForm = {
  checkIn:  FormControl<Date | null>;
  checkOut: FormControl<Date | null>;
  adults:   FormControl<number>;
  children: FormControl<number>;
  rooms:    FormControl<number>;
};

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
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private booking = new BookingService(this.http, this.auth);

  @ViewChild('rangePicker') rangePicker!: MatDateRangePicker<Date>;

  property: PropertyDetail | null = null;
  loading = true;
  submitting = false;
  placeholder = 'assets/placeholder.webp';

  // single declaration ✔
  errorText: string | null = null;

  private readonly today = new Date();
  private readonly tomorrow = new Date(
    this.today.getFullYear(), this.today.getMonth(), this.today.getDate() + 1
  );

  form: FormGroup<DetailForm> = this.fb.group<DetailForm>({
    checkIn:  this.fb.control<Date | null>(null, { validators: Validators.required }),
    checkOut: this.fb.control<Date | null>(null, { validators: Validators.required }),
    adults:   this.fb.control<number>(2, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    children: this.fb.control<number>(0, { nonNullable: true, validators: [Validators.min(0)] }),
    rooms:    this.fb.control<number>(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
  });

  // template helpers
  get a() { return this.form.controls.adults.value ?? 1; }
  get c() { return this.form.controls.children.value ?? 0; }
  get r() { return this.form.controls.rooms.value ?? 1; }

  get nights(): number {
    const ci = this.form.controls.checkIn.value;
    const co = this.form.controls.checkOut.value;
    if (!ci || !co) return 0;
    const ms = new Date(co).setHours(0,0,0,0) - new Date(ci).setHours(0,0,0,0);
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
      next: p => { this.property = p; this.loading = false; },
      error: () => { this.loading = false; }
    });

    // prefill from query params
    const qp = this.route.snapshot.queryParamMap;
    const ci = qp.get('checkIn');
    const co = qp.get('checkOut');
    const a  = qp.get('adults');
    const c  = qp.get('children');
    const r  = qp.get('rooms');

    const toDate = (s: string | null) => s ? new Date(s) : null;
    this.form.patchValue({
      checkIn:  toDate(ci) ?? this.today,
      checkOut: toDate(co) ?? this.tomorrow,
      adults:   a ? +a : 2,
      children: c ? +c : 0,
      rooms:    r ? +r : 1
    }, { emitEvent: false });
  }

  openDates(): void { this.rangePicker.open(); }

  onDateChanged(): void {
    const ci = this.form.controls.checkIn.value;
    const co = this.form.controls.checkOut.value;
    if (ci && co && co <= ci) {
      const fixed = new Date(ci); fixed.setDate(fixed.getDate() + 1);
      this.form.controls.checkOut.setValue(fixed);
    }
    this.errorText = null;
  }

  step(ctrl: 'adults'|'children'|'rooms', delta: number): void {
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

    // client guard: min 2 nights
    if (this.nights < 2) {
      this.errorText = 'Minimum stay is 2 nights.';
      this.snack.open(this.errorText, 'Close', { duration: 3000 });
      return;
    }

    const v = this.form.getRawValue();
    const toYMD = (d: Date) => new Date(d).toISOString().slice(0, 10);
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
      next: () => {
        this.submitting = false;
        this.snack.open('Booking confirmed ✅', 'Close', { duration: 2500 });
        this.router.navigate(['/profile']);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;

        const apiMsg =
          (err.error && (err.error.message || err.error.error || err.error.detail)) || '';

        if (err.status === 409 || /Dates not available/i.test(apiMsg)) {
          this.errorText = 'These dates are already booked. Please pick different dates.';
        } else if (err.status === 400) {
          if (/Minimum.*2.*night/i.test(apiMsg)) {
            this.errorText = 'Minimum stay is 2 nights.';
          } else if (/after.*checkIn/i.test(apiMsg)) {
            this.errorText = 'Check-out must be after check-in.';
          } else {
            this.errorText = apiMsg || 'Invalid booking data.';
          }
        } else if (err.status === 401) {
          this.errorText = 'Your session expired. Please sign in again.';
        } else if (err.status === 403) {
          // If Security blocked it (no body), fall back to a useful hint
          this.errorText = apiMsg ||
            (this.nights >= 2
              ? 'Could not complete booking. These dates may already be booked.'
              : 'Your session is invalid. Please sign in again.');
        } else {
          this.errorText = apiMsg || 'Booking failed.';
        }

        this.snack.open(this.errorText ?? 'Booking failed.', 'Close', { duration: 3500 });
      }
    });
  }
}
