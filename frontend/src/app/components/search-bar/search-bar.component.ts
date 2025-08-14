import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule, MatDateRangePicker } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

export interface SearchParams {
  q?: string;
  checkIn?: Date | null;
  checkOut?: Date | null;
  adults: number;
  children: number;
  rooms: number;
}

/** FormGroup tipado para evitar “Unresolved variable …” en el template */
type SearchForm = {
  q: FormControl<string>;
  checkIn: FormControl<Date | null>;
  checkOut: FormControl<Date | null>;
  adults: FormControl<number>;
  children: FormControl<number>;
  rooms: FormControl<number>;
};

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatIconModule, MatButtonModule, MatMenuModule,
    MatFormFieldModule, MatInputModule, MatAutocompleteModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  @Output() search = new EventEmitter<SearchParams>();
  @ViewChild('rangePicker') rangePicker!: MatDateRangePicker<Date>;

  cities: string[] = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse', 'Lille', 'Nice', 'Nantes'];

  readonly today = new Date();
  readonly tomorrow = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() + 1);

  form = new FormGroup<SearchForm>({
    q:        new FormControl('', { nonNullable: true }),
    checkIn:  new FormControl<Date | null>(this.today,    { validators: Validators.required }),
    checkOut: new FormControl<Date | null>(this.tomorrow, { validators: Validators.required }),
    adults:   new FormControl(2, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    children: new FormControl(0, { nonNullable: true, validators: [Validators.min(0)] }),
    rooms:    new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
  });

  get a(): number { return this.form.controls.adults.value ?? 0; }
  get c(): number { return this.form.controls.children.value ?? 0; }
  get r(): number { return this.form.controls.rooms.value ?? 0; }

  get datesLabel(): string {
    const ci = this.form.controls.checkIn.value;
    const co = this.form.controls.checkOut.value;
    if (!ci || !co) return 'Dates';
    const fmt: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${new Date(ci).toLocaleDateString(undefined, fmt)} – ${new Date(co).toLocaleDateString(undefined, fmt)}`;
  }
  get guestsLabel(): string {
    const a = this.a, c = this.c, r = this.r;
    return `${a} ${a === 1 ? 'adult' : 'adults'} • ${c} ${c === 1 ? 'child' : 'children'} • ${r} ${r === 1 ? 'room' : 'rooms'}`;
  }

  openDates(){ this.rangePicker.open(); }

  inc(ctrl: 'adults' | 'children' | 'rooms', step = 1){
    const control = this.form.controls[ctrl];
    const min = ctrl === 'children' ? 0 : 1;
    control.setValue(Math.max(min, (control.value ?? 0) + step));
  }
  dec(ctrl: 'adults' | 'children' | 'rooms'){ this.inc(ctrl, -1); }

  onDateChanged(){
    const ci = this.form.controls.checkIn.value;
    const co = this.form.controls.checkOut.value;
    if (ci && co && co <= ci) {
      const fixed = new Date(ci); fixed.setDate(fixed.getDate() + 1);
      this.form.controls.checkOut.setValue(fixed);
    }
  }

  resetGuests(e?: Event) {
    e?.stopPropagation();
    this.form.patchValue({ adults: 2, children: 0, rooms: 1 });
  }

  clearDestination(){ this.form.controls.q.setValue(''); }

  submit(){
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.search.emit({
      q: v.q.trim() || undefined,
      checkIn: v.checkIn,
      checkOut: v.checkOut,
      adults: v.adults,
      children: v.children,
      rooms: v.rooms
    });
  }
}
