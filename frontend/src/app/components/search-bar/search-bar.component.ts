import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
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
import { environment } from '../../../environments/environment';

export interface SearchParams {
  q?: string;
  region?: string | null;  // NUEVO (opcional)
  city?: string | null;    // NUEVO (opcional)
  checkIn?: Date | null;
  checkOut?: Date | null;
  adults: number;
  children: number;
  rooms: number;
}

/** Strongly typed FormGroup para evitar avisos en template */
type SearchForm = {
  q: FormControl<string>;
  region: FormControl<string | null>;
  city: FormControl<string | null>;
  checkIn: FormControl<Date | null>;
  checkOut: FormControl<Date | null>;
  adults: FormControl<number>;
  children: FormControl<number>;
  rooms: FormControl<number>;
};

// Opciones internas del autocomplete
type CityOpt = { type: 'city'; city: string; regionKey: string; regionName: string };
type RegionOpt = { type: 'region'; regionKey: string; regionName: string };
type AnyOpt = CityOpt | RegionOpt;

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
  /** Estado inicial (opcional) */
  @Input() initial?: Partial<SearchParams & { checkIn?: string; checkOut?: string }> | null = null;

  @Output() search = new EventEmitter<SearchParams>();
  @ViewChild('rangePicker') rangePicker!: MatDateRangePicker<Date>;

  private markets = environment.markets;
  // Flatten rápido para búsquedas
  private citiesAll: CityOpt[] = this.markets.flatMap(m =>
    m.cities.map<CityOpt>(c => ({ type: 'city', city: c, regionKey: m.key, regionName: m.name }))
  );
  private regionsAll: RegionOpt[] = this.markets.map<RegionOpt>(m => ({
    type: 'region', regionKey: m.key, regionName: m.name
  }));

  readonly today = this.startOfDay(new Date());
  readonly tomorrow = this.addDays(this.today, 1);

  form = new FormGroup<SearchForm>({
    q:        new FormControl('', { nonNullable: true }),
    region:   new FormControl<string | null>(null),
    city:     new FormControl<string | null>(null),
    checkIn:  new FormControl<Date | null>(this.today,    { validators: Validators.required }),
    checkOut: new FormControl<Date | null>(this.tomorrow, { validators: Validators.required }),
    adults:   new FormControl(2, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    children: new FormControl(0, { nonNullable: true, validators: [Validators.min(0)] }),
    rooms:    new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
  });

  ngOnInit() {
    if (this.initial) {
      const ic = this.asDate(this.initial.checkIn as any);
      const oc = this.asDate(this.initial.checkOut as any);
      this.form.patchValue({
        q: this.initial.q ?? '',
        region: this.initial.region ?? null,
        city: this.initial.city ?? null,
        checkIn: ic ?? this.form.controls.checkIn.value,
        checkOut: oc ?? this.form.controls.checkOut.value,
        adults: this.initial.adults ?? this.form.controls.adults.value,
        children: this.initial.children ?? this.form.controls.children.value,
        rooms: this.initial.rooms ?? this.form.controls.rooms.value
      });
    }

    // Si el usuario escribe a mano, anulamos selección previa de región/ciudad
    this.form.controls.q.valueChanges.subscribe(() => {
      this.form.patchValue({ region: null, city: null }, { emitEvent: false });
    });
  }

  // ===== Helpers fecha =====
  private startOfDay(d: Date){ const x = new Date(d); x.setHours(0,0,0,0); return x; }
  private addDays(d: Date, days: number){ const x = new Date(d); x.setDate(x.getDate() + days); return x; }

  /** Normaliza Date | string | null | undefined → Date | null */
  private asDate(v: Date | string | null | undefined): Date | null {
    if (!v) return null;
    return v instanceof Date ? this.startOfDay(v) : this.startOfDay(new Date(v));
  }

  // ===== Labels UI =====
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
      this.form.controls.checkOut.setValue(this.addDays(ci, 1));
    }
  }

  resetGuests(e?: Event) {
    e?.stopPropagation();
    this.form.patchValue({ adults: 2, children: 0, rooms: 1 });
  }

  clearDestination(){
    this.form.patchValue({ q: '', region: null, city: null });
  }

  // ===== Autocomplete =====

  /** Devuelve grupos filtrados: [{ regionKey, regionName, cities: CityOpt[] }] */
  get groups(){
    const q = (this.form.controls.q.value || '').trim().toLowerCase();

    // Si está vacío, mostramos todos los grupos con sus ciudades tal cual
    if (!q) {
      return this.markets.map(m => ({
        regionKey: m.key,
        regionName: m.name,
        cities: m.cities.map<CityOpt>(c => ({ type: 'city', city: c, regionKey: m.key, regionName: m.name }))
      }));
    }

    // Filtro por región o ciudad que contenga el término
    const regionHit = (name: string) => name.toLowerCase().includes(q);
    const cityHit   = (name: string) => name.toLowerCase().includes(q);

    return this.markets
      .map(m => {
        const cities = m.cities
          .filter(c => cityHit(c))
          .map<CityOpt>(c => ({ type: 'city', city: c, regionKey: m.key, regionName: m.name }));
        const regionMatches = regionHit(m.name);
        return (regionMatches || cities.length) ? { regionKey: m.key, regionName: m.name, cities } : null;
      })
      .filter((g): g is NonNullable<typeof g> => !!g);
  }

  /** Manejamos la selección codificada en el valor */
  onSelect(value: string){
    // Formato esperado:
    //   "region:<regionKey>"
    //   "city:<cityName>|<regionKey>"
    if (value.startsWith('region:')) {
      const regionKey = value.slice('region:'.length);
      const reg = this.markets.find(m => m.key === regionKey);
      if (reg) {
        this.form.patchValue({
          q: reg.name,
          region: reg.name,
          city: null
        }, { emitEvent: false });
      }
      return;
    }

    if (value.startsWith('city:')) {
      const rest = value.slice('city:'.length);
      const [city, regionKey] = rest.split('|');
      const reg = this.markets.find(m => m.key === regionKey);
      this.form.patchValue({
        q: city,
        region: reg?.name ?? null,
        city: city
      }, { emitEvent: false });
    }
  }

  // ===== Submit =====
  submit(){
    if (this.form.invalid) return;
    const v = this.form.getRawValue();

    // Si el usuario ha escrito a mano y no ha elegido nada del autocomplete,
    // dejamos region/city en null y sólo usamos q
    this.search.emit({
      q: v.q.trim() || undefined,
      region: v.region,
      city: v.city,
      checkIn: v.checkIn,
      checkOut: v.checkOut,
      adults: v.adults,
      children: v.children,
      rooms: v.rooms
    });
  }
}
