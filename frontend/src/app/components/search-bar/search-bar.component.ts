import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

/* Angular Material */
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';

export type SearchParams = {
  q: string;   // lieu
  in: string;  // yyyy-MM-dd
  out: string; // yyyy-MM-dd
  adults: number;
  children: number;
  rooms: number;
};

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatSelectModule
  ],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  cities = ['Paris', 'Bruxelles', 'Lyon', 'Marseille', 'Bordeaux', 'Lille', 'Nice', 'Toulouse', 'Nantes'];
  adultsOptions = Array.from({ length: 10 }, (_, i) => i + 1);
  childrenOptions = Array.from({ length: 11 }, (_, i) => i);
  roomsOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  today = new Date();
  minCheckIn = this.today;
  minCheckOut = this.addDays(this.today, 1);

  form = this.fb.group({
    q: ['', [Validators.required, Validators.minLength(2)]],
    checkIn: [this.today, [Validators.required]],
    checkOut: [this.addDays(this.today, 1), [Validators.required]],
    adults: [2, [Validators.required, Validators.min(1)]],
    children: [0, [Validators.required, Validators.min(0)]],
    rooms: [1, [Validators.required, Validators.min(1)]],
  });

  @Output() search = new EventEmitter<SearchParams>();

  constructor(private fb: FormBuilder, private router: Router) {
    this.form.get('checkIn')!.valueChanges.subscribe(val => {
      if (!val) return;
      const next = this.addDays(val as Date, 1);
      this.minCheckOut = next;
      const out = this.form.get('checkOut')!.value as Date | null;
      if (!out || out <= next) this.form.get('checkOut')!.setValue(next);
    });
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    const params: SearchParams = {
      q: v.q!.trim(),
      in: this.toYMD(v.checkIn as Date),
      out: this.toYMD(v.checkOut as Date),
      adults: Number(v.adults),
      children: Number(v.children),
      rooms: Number(v.rooms),
    };
    this.search.emit(params);
    this.router.navigate(['/properties'], { queryParams: params });
  }

  private toYMD(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  private addDays(d: Date, days: number): Date {
    const nd = new Date(d);
    nd.setDate(nd.getDate() + days);
    return nd;
  }
}
