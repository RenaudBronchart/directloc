import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { finalize } from 'rxjs/operators';

import { ProfileService } from '../../services/profile.service';
import { ProfileDto, Gender, PhoneVisibility } from '../../dto/profile.dto';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule
  ],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private profiles = inject(ProfileService);

  @ViewChild('file', { static: false }) fileInput?: ElementRef<HTMLInputElement>;

  step: 1 | 2 | 3 = 1;
  loading = true;
  saving = false;

  email = '';
  avatarUrl: string | null = null;

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

  // 3 forms (uno por paso)
  form1 = this.fb.group({
    fullName: this.fb.nonNullable.control('', [Validators.maxLength(120)]),
    avatar:   this.fb.nonNullable.control(''), // solo para UI
  });

  form2 = this.fb.group({
    phoneCountry: this.fb.nonNullable.control(''),
    phone:        this.fb.nonNullable.control('', [Validators.maxLength(40)]),
    gender:       this.fb.nonNullable.control<Gender | ''>(''),
    nationality:  this.fb.nonNullable.control(''),
    dateOfBirth:  this.fb.nonNullable.control(''), // yyyy-MM-dd
  });

  form3 = this.fb.group({
    phoneVisibility: this.fb.nonNullable.control<PhoneVisibility | ''>(''),
    wantsToHost:     this.fb.nonNullable.control<boolean | null>(null),
    locale:          this.fb.nonNullable.control(''),
    timezone:        this.fb.nonNullable.control(''),
  });

  get f1() { return this.form1.controls; }
  get f2() { return this.form2.controls; }
  get f3() { return this.form3.controls; }

  ngOnInit(): void {
    // Prefill from /api/profile
    this.profiles.get()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (p: ProfileDto) => {
          this.email     = p.email ?? '';
          this.avatarUrl = p.avatarUrl ?? null;

          this.form1.patchValue({ fullName: [p.firstName, p.lastName].filter(Boolean).join(' ') }, { emitEvent: false });

          this.form2.patchValue({
            phoneCountry: p.phoneCountry ?? '',
            phone:        p.phone ?? '',
            gender:       (p.gender ?? '') as any,
            nationality:  p.nationality ?? '',
            dateOfBirth:  p.dateOfBirth ?? '',
          }, { emitEvent: false });

          this.form3.patchValue({
            phoneVisibility: (p.phoneVisibility ?? '') as any,
            wantsToHost:     p.wantsToHost ?? null,
            locale:          p.locale ?? (navigator.language?.slice(0, 2) ?? ''),
            timezone:        p.timezone ?? (Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''),
          }, { emitEvent: false });
        },
        error: () => this.snack.open('Could not load your profile.', 'Close', { duration: 2500 })
      });
  }

  /* ---------- Flow ---------- */
  next() { if (this.step < 3) this.step++; }
  back() { if (this.step > 1) this.step--; }

  async saveStep(step: 1|2|3) {
    if (this.saving) return;
    this.saving = true;

    const payload: any = {};
    if (step === 1) {
      payload.fullName = (this.f1.fullName.value || '').trim() || null;
    } else if (step === 2) {
      payload.phoneCountry = this.f2.phoneCountry.value || null;
      payload.phone        = (this.f2.phone.value || '').trim() || null;
      // auto-prepend prefix if missing and we have a country
      const iso = String(this.f2.phoneCountry.value || '').toUpperCase();
      const prefix = this.prefixByIso[iso];
      const phoneNow: string = this.f2.phone.value || '';
      if (prefix && phoneNow && !/^\+/.test(phoneNow)) {
        this.f2.phone.setValue(`${prefix} ${phoneNow}`);
        payload.phone = this.f2.phone.value;
      }
      payload.gender      = this.f2.gender.value || null;
      payload.nationality = this.f2.nationality.value || null;
      payload.dateOfBirth = this.f2.dateOfBirth.value || null;
    } else if (step === 3) {
      payload.phoneVisibility = this.f3.phoneVisibility.value || null;
      payload.wantsToHost     = this.f3.wantsToHost.value;
      payload.locale          = (this.f3.locale.value || '').trim() || null;
      payload.timezone        = (this.f3.timezone.value || '').trim() || null;
    }

    this.profiles.update(payload)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.snack.open('Saved.', 'Close', { duration: 1200 });
          if (step < 3) this.next();
          else this.router.navigateByUrl('/'); // o donde quieras llevarle al terminar
        },
        error: () => this.snack.open('Could not save. Try again.', 'Close', { duration: 2500 })
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
      input.value = ''; return;
    }
    this.profiles.uploadAvatar(file).subscribe({
      next: url => { this.avatarUrl = url || this.avatarUrl; this.snack.open('Avatar updated.', 'Close', { duration: 1500 }); input.value = ''; },
      error: ()   => { this.snack.open('Upload failed. Please try again.', 'Close', { duration: 3000 }); input.value = ''; }
    });
  }

  fileUrl(u?: string | null): string {
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    const base = environment.apiBase.replace(/\/$/, '');
    return u.startsWith('/') ? base + u : `${base}/${u}`;
  }

  flag(iso: string): string {
    if (!iso) return '🌐';
    const cc = iso.toUpperCase();
    const A = 0x1F1E6;
    return String.fromCodePoint(A + (cc.charCodeAt(0) - 65), A + (cc.charCodeAt(1) - 65));
  }

  protected readonly navigator = navigator;
}
