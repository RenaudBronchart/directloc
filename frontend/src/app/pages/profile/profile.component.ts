import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';

import { MatCardModule }      from '@angular/material/card';
import { MatButtonModule }    from '@angular/material/button';
import { MatIconModule }      from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { finalize } from 'rxjs/operators';

import { ProfileService } from '../../services/profile.service';
import { ProfileDto, Gender, PhoneVisibility } from '../../dto/profile.dto';
import { BookingService } from '../../services/booking.service';
import { MessagingService } from '../../services/messaging.service';
import { BookingModel } from '../../models/booking.model';

type EditableField =
  | 'fullName' | 'phone' // phoneCountry is edited inside phone
  | 'gender' | 'nationality' | 'dateOfBirth'
  | 'phoneVisibility';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private profiles = inject(ProfileService);
  private bookingsSvc = inject(BookingService);
  private messaging = inject(MessagingService);

  @ViewChild('file', { static: false }) fileInput?: ElementRef<HTMLInputElement>;

  loading = true;
  saving = false;

  email = '';
  avatarUrl: string | null = null;

  // Inline editing per field
  editing: EditableField | null = null;
  private snapshot: Record<EditableField, string> = {
    fullName: '', phone: '',
    gender: '', nationality: '', dateOfBirth: '',
    phoneVisibility: ''
  };

  // Bookings & filters
  bookingsLoading = true;
  bookingsError = false;
  bookings: BookingModel[] = [];
  tab: 'upcoming' | 'past' | 'cancelled' | 'all' = 'upcoming';
  q = '';

  placeholder = 'assets/placeholder.webp';

  // Simple catalogs
  genders: Gender[] = ['MALE','FEMALE','OTHER'];
  phoneVisibilities: { value: PhoneVisibility; label: string }[] = [
    { value: 'NEVER',            label: 'Never' },
    { value: 'AFTER_ACCEPT',     label: 'After booking accepted' },
    { value: 'ALWAYS_FOR_HOSTS', label: 'Always (hosts only)' },
  ];

  countries = [
    { code: 'ES', name: 'Spain',          prefix: '+34' },
    { code: 'FR', name: 'France',         prefix: '+33' },
    { code: 'IT', name: 'Italy',          prefix: '+39' },
    { code: 'DE', name: 'Germany',        prefix: '+49' },
    { code: 'GB', name: 'United Kingdom', prefix: '+44' },
    { code: 'US', name: 'United States',  prefix: '+1'  },
    { code: 'PT', name: 'Portugal',       prefix: '+351'},
    { code: 'IE', name: 'Ireland',        prefix: '+353'},
    { code: 'NL', name: 'Netherlands',    prefix: '+31' },
    { code: 'BE', name: 'Belgium',        prefix: '+32' },
    { code: 'CH', name: 'Switzerland',    prefix: '+41' },
    { code: 'AT', name: 'Austria',        prefix: '+43' },
    { code: 'SE', name: 'Sweden',         prefix: '+46' },
    { code: 'NO', name: 'Norway',         prefix: '+47' },
    { code: 'DK', name: 'Denmark',        prefix: '+45' },
    { code: 'FI', name: 'Finland',        prefix: '+358'},
    { code: 'PL', name: 'Poland',         prefix: '+48' },
    { code: 'CZ', name: 'Czechia',        prefix: '+420'},
    { code: 'HU', name: 'Hungary',        prefix: '+36' },
    { code: 'RO', name: 'Romania',        prefix: '+40' },
    { code: 'GR', name: 'Greece',         prefix: '+30' },
    { code: 'TR', name: 'Türkiye',        prefix: '+90' },
    { code: 'AR', name: 'Argentina',      prefix: '+54' },
    { code: 'BR', name: 'Brazil',         prefix: '+55' },
    { code: 'MX', name: 'Mexico',         prefix: '+52' },
    { code: 'CL', name: 'Chile',          prefix: '+56' },
    { code: 'CO', name: 'Colombia',       prefix: '+57' },
    { code: 'CA', name: 'Canada',         prefix: '+1'  },
    { code: 'AU', name: 'Australia',      prefix: '+61' },
    { code: 'NZ', name: 'New Zealand',    prefix: '+64' },
    { code: 'JP', name: 'Japan',          prefix: '+81' },
    { code: 'KR', name: 'South Korea',    prefix: '+82' },
    { code: 'CN', name: 'China',          prefix: '+86' },
    { code: 'IN', name: 'India',          prefix: '+91' },
  ];
  prefixByIso: Record<string,string> = Object.fromEntries(this.countries.map(c => [c.code, c.prefix]));

  form = this.fb.group({
    fullName:        this.fb.nonNullable.control('', [Validators.maxLength(120)]),
    phone:           this.fb.nonNullable.control('', [Validators.maxLength(40)]),
    phoneCountry:    this.fb.nonNullable.control(''),
    gender:          this.fb.nonNullable.control<Gender | ''>(''),
    nationality:     this.fb.nonNullable.control(''),
    dateOfBirth:     this.fb.nonNullable.control(''),   // yyyy-MM-dd
    phoneVisibility: this.fb.nonNullable.control<PhoneVisibility | ''>(''),
  });
  get f() { return this.form.controls; }

  // Stats
  get tripsCount()  { return this.bookings.length; }
  get nightsCount() { return this.bookings.reduce((s, b) => s + this.diffDays(b.checkIn, b.checkOut), 0); }
  get memberSince() {
    if (!this.bookings.length) return '—';
    const y = new Date(Math.min(...this.bookings.map(b => Date.parse(b.checkIn)))).getFullYear();
    return String(y);
  }
  get spentTotal() {
    return this.bookings.filter(b => !this.isCancelled(b))
      .reduce((s, b) => s + (b.totalPrice || 0), 0);
  }
  copyEmail() {
    const value = this.email || '';
    if (!value) return;

    try {
      if ('clipboard' in navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(value);
        this.snack.open('Email copied.', 'Close', { duration: 1200 });
        return;
      }
      // Fallback para navegadores antiguos
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.snack.open('Email copied.', 'Close', { duration: 1200 });
    } catch {
      this.snack.open('Could not copy email.', 'Close', { duration: 2000 });
    }
  }

  /** Bookings displayed (tab + search) */
  get displayed(): BookingModel[] {
    const byTab = (() => {
      switch (this.tab) {
        case 'upcoming':  return this.bookings.filter(b => !this.isPast(b) && !this.isCancelled(b));
        case 'past':      return this.bookings.filter(b =>  this.isPast(b));
        case 'cancelled': return this.bookings.filter(b =>  this.isCancelled(b));
        default:          return this.bookings;
      }
    })();
    const q = this.q.trim().toLowerCase();
    if (!q) return byTab;
    return byTab.filter(b =>
      (b.propertyTitle || '').toLowerCase().includes(q) ||
      (b.propertyLocation || '').toLowerCase().includes(q) ||
      (b.checkIn || '').includes(q) || (b.checkOut || '').includes(q)
    );
  }

  ngOnInit(): void {
    const qp = new URLSearchParams(location.search);
    if (qp.get('onboarding') === '1') {
      this.snack.open('Welcome! Complete your profile to get started.', 'Close', { duration: 3000 });
    }



    // Profile
    this.profiles.get()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (p: ProfileDto) => {
          this.email     = p.email ?? '';
          this.avatarUrl = p.avatarUrl ?? null;

          this.form.patchValue({
            fullName:        p.fullName        ?? '',
            phone:           p.phone           ?? '',
            phoneCountry:    p.phoneCountry    ?? '',
            gender:          (p.gender ?? '') as any,
            nationality:     p.nationality     ?? '',
            dateOfBirth:     p.dateOfBirth     ?? '',
            phoneVisibility: (p.phoneVisibility ?? '') as any,
          }, { emitEvent: false });
        },
        error: () => this.snack.open('Could not load your profile.', 'Close', { duration: 3000 })
      });

    // Bookings
    this.bookingsSvc.my()
      .pipe(finalize(() => (this.bookingsLoading = false)))
      .subscribe({
        next: list => { this.bookings = list ?? []; },
        error: () => { this.bookingsError = true; }
      });
  }

  /* ---------- Avatar ---------- */
  pickAvatar() { this.fileInput?.nativeElement.click(); }
  onFile(input: HTMLInputElement) {
    const file = input.files?.[0];
    if (!file) return;
    const MAX_MB = 5;
    if (file.size > MAX_MB * 1024 * 1024) {
      this.snack.open(`Max file size is ${MAX_MB}MB.`, 'Close', { duration: 3000 });
      input.value = '';
      return;
    }
    this.profiles.uploadAvatar(file).subscribe({
      next: url => { this.avatarUrl = url || this.avatarUrl; this.snack.open('Avatar updated.', 'Close', { duration: 2000 }); input.value = ''; },
      error: ()   => { this.snack.open('Upload failed. Please try again.', 'Close', { duration: 3000 }); input.value = ''; }
    });
  }

  /* ---------- My data: inline edit ---------- */
  startField(field: EditableField) {
    this.snapshot[field] = (this.f as any)[field].value || '';
    this.editing = field;
  }
  cancelField(field: EditableField) {
    (this.f as any)[field].setValue(this.snapshot[field] || '');
    // Special case: cancelling phone also restores phoneCountry snapshot if needed
    if (field === 'phone') {
      this.f.phoneCountry.setValue(this.f.phoneCountry.value || '');
    }
    this.editing = null;
  }
  saveField(field: EditableField) {
    if (this.saving) return;

    const payload: Partial<ProfileDto> = {};
    const current = (this.f as any)[field].value;

    if (field === 'phone') {
      // When saving phone, also send phoneCountry (edited inside the same row)
      payload.phone = (current || '').trim() || null;
      payload.phoneCountry = this.f.phoneCountry.value || null;

      // If number doesn't start with +, prepend prefix from country (if any)
      const iso = String(this.f.phoneCountry.value || '').toUpperCase();
      const prefix = this.prefixByIso[iso];
      const phoneNow: string = this.f.phone.value || '';
      if (prefix && phoneNow && !/^\+/.test(phoneNow)) {
        this.f.phone.setValue(`${prefix} ${phoneNow}`);
        payload.phone = this.f.phone.value;
      }

    } else if (field === 'gender') {
      payload.gender = current || null;
    } else if (field === 'nationality') {
      payload.nationality = current || null;
    } else if (field === 'dateOfBirth') {
      payload.dateOfBirth = current || null; // input type="date" is yyyy-MM-dd
    } else if (field === 'phoneVisibility') {
      payload.phoneVisibility = current || null;
    } else if (field === 'fullName') {
      payload.fullName = (current || '').trim() || null;
    }

    this.saving = true;
    this.profiles.update(payload)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: p => {
          // Patch back returned values defensively
          this.form.patchValue({
            fullName:        p.fullName        ?? this.f.fullName.value,
            phone:           p.phone           ?? this.f.phone.value,
            phoneCountry:    p.phoneCountry    ?? this.f.phoneCountry.value,
            gender:          (p.gender ?? this.f.gender.value) as any,
            nationality:     p.nationality     ?? this.f.nationality.value,
            dateOfBirth:     p.dateOfBirth     ?? this.f.dateOfBirth.value,
            phoneVisibility: (p.phoneVisibility ?? this.f.phoneVisibility.value) as any,
          }, { emitEvent: false });

          this.editing = null;
          this.snack.open('Saved.', 'Close', { duration: 1600 });
        },
        error: () => this.snack.open('Could not save. Try again.', 'Close', { duration: 2500 })
      });
  }

  /* ---------- Bookings helpers ---------- */
  setTab(t: 'upcoming'|'past'|'cancelled'|'all') { this.tab = t; }
  onSearch(ev: Event) { this.q = (ev.target as HTMLInputElement)?.value ?? ''; }

  private isCancelled(b: BookingModel) {
    const s = String(b.status || '').toUpperCase();
    return s === 'CANCELLED' || s === 'CANCELED';
  }
  private isPast(b: BookingModel) {
    const today = new Date(); today.setHours(0,0,0,0);
    return new Date(b.checkOut) < today;
  }
  private diffDays(a: string, b: string) {
    const ms = new Date(b).getTime() - new Date(a).getTime();
    return Math.max(0, Math.round(ms / 86400000));
  }

  statusLabel(status: unknown): string {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'REQUESTED': return 'Requested';
      case 'ACCEPTED':
      case 'APPROVED':  return 'Accepted';
      case 'REJECTED':
      case 'DECLINED':  return 'Rejected';
      case 'CANCELLED':
      case 'CANCELED':  return 'Cancelled';
      default:          return s || '—';
    }
  }
  statusClass(status: unknown): string {
    const s = String(status || '').toUpperCase();
    if (s === 'REQUESTED') return 'req';
    if (s === 'ACCEPTED' || s === 'APPROVED') return 'acc';
    if (s === 'REJECTED' || s === 'DECLINED') return 'rej';
    if (s === 'CANCELLED' || s === 'CANCELED') return 'can';
    return '';
  }

  formatMoney(v?: number | null, currency = 'EUR'): string {
    if (v == null) return '';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(v);
  }

  fileUrl(u?: string | null): string {
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    const base = environment.apiBase.replace(/\/$/, '');
    return u.startsWith('/') ? base + u : `${base}/${u}`;
  }
  imgError(evt: Event) {
    const img = evt.target as HTMLImageElement | null;
    if (!img) return;
    const ds = img.dataset as DOMStringMap;
    if (!ds['fallback']) { ds['fallback'] = '1'; img.src = this.placeholder; }
  }
  initials(email: string): string {
    if (!email) return 'U';
    const name = email.split('@')[0]?.replace(/[._-]+/g, ' ') ?? 'User';
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? 'U') + (parts[1]?.[0] ?? '')).toUpperCase();
  }

  // Simple flag emoji by ISO-2
  flag(iso: string): string {
    if (!iso) return '🌐';
    const cc = iso.toUpperCase();
    const A = 0x1F1E6;
    return String.fromCodePoint(
      A + (cc.charCodeAt(0) - 65),
      A + (cc.charCodeAt(1) - 65)
    );
  }

  goBooking(b: BookingModel) { this.router.navigate(['/bookings', b.id]); }
  messageHost(b: BookingModel) {
    this.messaging.openForBooking(Number(b.id)).subscribe(c =>
      this.router.navigate(['/messages', c.id], {
        queryParams: { title: c.propertyTitle, other: c.otherUserEmail }
      })
    );
  }

  trackBookingId = (_: number, b: BookingModel) => b.id;

  protected readonly navigator = navigator;
}
