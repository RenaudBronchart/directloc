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

import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { PropertyService } from '../../../services/property.service';
import { PropertyDetail } from '../../../models/property.model';
import { AuthService } from '../../../services/auth.service';
import { BookingService } from '../../../services/booking.service';
import { BookingRequest } from '../../../types/booking';

import { addDays, format } from 'date-fns';

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
  private booking = inject(BookingService);

  @ViewChild('rangePicker') rangePicker!: MatDateRangePicker<Date>;

  property: PropertyDetail | null = null;
  loading = true;
  submitting = false;
  placeholder = 'assets/placeholder.webp';

  errorText: string | null = null;

  // --- calendario: helpers y estado ---
  private startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
  today = this.startOfDay(new Date());
  booked = new Set<string>(); // días ocupados 'yyyy-MM-dd'

  form: FormGroup<DetailForm> = this.fb.group<DetailForm>({
    checkIn:  this.fb.control<Date | null>(null, { validators: Validators.required }),
    checkOut: this.fb.control<Date | null>(null, { validators: Validators.required }),
    adults:   this.fb.control<number>(2, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    children: this.fb.control<number>(0, { nonNullable: true, validators: [Validators.min(0)] }),
    rooms:    this.fb.control<number>(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
  });

  // helpers
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

        // cargar días ocupados para el calendario (6 meses vista)
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

    // prefill from query params
    const qp = this.route.snapshot.queryParamMap;
    const ci = qp.get('checkIn');
    const co = qp.get('checkOut');
    const a  = qp.get('adults');
    const c  = qp.get('children');
    const r  = qp.get('rooms');

    const toDate = (s: string | null) => s ? new Date(s) : null;
    const today = this.today;
    const tomorrow = addDays(today, 1);

    this.form.patchValue({
      checkIn:  toDate(ci) ?? today,
      checkOut: toDate(co) ?? tomorrow,
      adults:   a ? +a : 2,
      children: c ? +c : 0,
      rooms:    r ? +r : 1
    }, { emitEvent: false });
  }

  // --- calendario: pinta gris pasados, rojo ocupados ---
  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    if (view !== 'month') return '';
    const d = this.startOfDay(cellDate);
    const iso = format(d, 'yyyy-MM-dd');
    if (d < this.today) return 'date-past';
    if (this.booked.has(iso)) return 'date-booked';
    return '';
  };

  // --- calendario: bloquea selección de pasados/ocupados ---
  rangeDateFilter = (d: Date | null): boolean => {
    if (!d) return false;
    const day = this.startOfDay(d);
    const iso = format(day, 'yyyy-MM-dd');
    if (day < this.today) return false;
    if (this.booked.has(iso)) return false;
    return true;
  };

  openDates(): void { this.rangePicker.open(); }

  onDateChanged(): void {
    const ci = this.form.controls.checkIn.value;
    const co = this.form.controls.checkOut.value;
    if (ci && co && co <= ci) {
      const fixed = addDays(this.startOfDay(ci), 1);
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

    // client guard: min 2 noches
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
      next: () => {
        this.submitting = false;
        this.snack.open('Booking confirmed ✅', 'Close', { duration: 2500 });
        this.router.navigate(['/profile']);
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
}
