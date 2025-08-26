// src/app/pages/property/property-detail/property-detail.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { MatDatepickerModule, MatDateRangePicker } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { PropertyService } from '../../../services/property.service';
import { PropertyDetail } from '../../../models/property.model';

import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';

type BookingForm = {
  checkIn: FormControl<Date | null>;
  checkOut: FormControl<Date | null>;
  adults: FormControl<number>;
  children: FormControl<number>;
  rooms: FormControl<number>;
};

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatCardModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './property-detail.component.html',
  styleUrls: ['./property-detail.component.scss']
})
export class PropertyDetailComponent implements OnInit {
  property: PropertyDetail | null = null;
  loading = true;
  placeholder = 'assets/placeholder.webp';

  // Exponer Math al template (para Math.max)
  readonly Math = Math;

  @ViewChild('rangePicker') rangePicker!: MatDateRangePicker<Date>;

  // === Formulario de reserva ===
  form = new FormGroup<BookingForm>({
    checkIn:  new FormControl<Date | null>(null, { validators: Validators.required }),
    checkOut: new FormControl<Date | null>(null, { validators: Validators.required }),
    adults:   new FormControl(2, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    children: new FormControl(0, { nonNullable: true, validators: [Validators.min(0)] }),
    rooms:    new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] })
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: PropertyService,
    private booking: BookingService,
    public auth: AuthService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getPropertyById(id).subscribe({
      next: p => { this.property = p; this.loading = false; },
      error: () => { this.loading = false; }
    });

    // Prefill desde query params
    const qp = this.route.snapshot.queryParamMap;
    const ci = qp.get('checkIn'); const co = qp.get('checkOut');
    const a  = +(qp.get('adults') ?? 2);
    const c  = +(qp.get('children') ?? 0);
    const r  = +(qp.get('rooms') ?? 1);
    if (ci && co) this.form.patchValue({ checkIn: new Date(ci), checkOut: new Date(co) });
    this.form.patchValue({ adults: a, children: c, rooms: r });
  }

  openDates(){ this.rangePicker?.open(); }

  private toYMD(d: Date): string {
    const y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
    return new Date(Date.UTC(y, m, day)).toISOString().slice(0,10);
  }

  requestToBook(): void {
    if (!this.property) return;

    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v = this.form.getRawValue();
    const payload = {
      propertyId: this.property.id,  // UUID
      checkIn: this.toYMD(v.checkIn!),
      checkOut: this.toYMD(v.checkOut!),
      adults: v.adults!,
      children: v.children!,
      rooms: v.rooms!
    };

    this.booking.create(payload).subscribe({
      next: () => {
        this.snack.open('Booking confirmed ✅', 'Close', { duration: 2500 });
        this.router.navigate(['/profile'], { queryParams: { tab: 'bookings' } });
      },
      error: (err) => {
        const msg =
          err?.status === 409 ? 'Those dates are no longer available.' :
            err?.status === 400 ? (err.error?.message ?? 'Invalid request.') :
              'Booking failed. Please try again.';
        this.snack.open(msg, 'Close', { duration: 3500 });
      }
    });
  }
}
