import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { PropertyType, ViewType } from '../../../dto/property.dto';
import { PropertyRequestDto } from '../../../dto/property.dto';
import { PropertyService } from '../../../services/property.service';

type Region = {
  key: string;
  name: string;
  country: string;
  currency: string;
  defaultCity: string;
  cities: string[];
};

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './property-form.component.html',
  styleUrls: ['./property-form.component.scss']
})
export class PropertyFormComponent implements OnInit, OnChanges {
  /** If `id` is present → edit mode, otherwise → create mode */
  @Input() id?: string | null;
  /** Optional initial data to prefill the form (edit mode) */
  @Input() initialData?: PropertyRequestDto | null;

  loading = false;

  // Regiones desde environment
  regions: Region[] = (environment as any).markets ?? [];
  defaultRegionKey: string = (environment as any).defaultMarketKey ?? this.regions[0]?.key;

  currentRegion?: Region;
  cityOptions: string[] = [];
  unknownCity: string | null = null;

  // Catálogos (valores EXACTOS del backend)
  propertyTypes = ['APARTMENT','HOUSE','VILLA','CHALET','CABIN','STUDIO','LOFT','FARMHOUSE','COTTAGE','OTHER'];
  views = ['SEA','MOUNTAIN','GARDEN','CITY','RIVER','LAKE','FOREST','NONE'];

  form = this.fb.group({
    title:        ['', [Validators.required, Validators.minLength(3)]],
    description:  ['', [Validators.required, Validators.minLength(10)]],

    regionKey:    ['' , [Validators.required]],
    location:     ['', [Validators.required, Validators.minLength(2)]], // City

    pricePerNight:[null as number | null, [Validators.required, Validators.min(0)]],
    maxGuests:    [null as number | null, [Validators.min(1)]],
    bedrooms:     [null as number | null, [Validators.min(0)]],
    bathrooms:    [null as number | null, [Validators.min(0)]],

    propertyType: [null as string | null], // ENUM (UPPERCASE)
    beds:         [null as number | null, [Validators.min(0)]],
    areaSqm:      [null as number | null, [Validators.min(0)]],

    // toggles / reglas
    parking:             [false],
    petFriendly:         [false], // nombre correcto del back
    smokingAllowed:      [false],
    dedicatedWorkspace:  [false], // lo mapeamos a workspace
    airConditioning:     [false],
    heating:             [false],
    pool:                [false],
    hotTub:              [false],
    garden:              [false],
    terrace:             [false],
    balcony:             [false],
    accessible:          [false],

    // cuantificables
    wifiMbps:     [null as number | null, [Validators.min(0)]],
    minNights:    [null as number | null, [Validators.min(0)]], // el back permite 0
    checkInFrom:  [null as string | null],   // "HH:mm"
    checkOutUntil:[null as string | null],   // "HH:mm"
    beachKm:      [null as number | null, [Validators.min(0)]],
    centerKm:     [null as number | null, [Validators.min(0)]],
    view:         [null as string | null],   // lo convertimos a viewType

    coverUrl:     ['']
  });

  constructor(
    private fb: FormBuilder,
    private api: PropertyService,
    private snack: MatSnackBar,
    private router: Router
  ) {}

  // ===== helpers de región/ciudad =====
  private setRegionByKey(key?: string) {
    this.currentRegion =
      this.regions.find(r => r.key === key) ||
      this.regions.find(r => r.key === this.defaultRegionKey);
    this.cityOptions = [...(this.currentRegion?.cities ?? [])];

    const locCtrl = this.form.get('location');
    const currCity = (locCtrl?.value ?? '').toString();
    if (!this.currentRegion?.cities.includes(currCity)) {
      this.unknownCity = null;
      locCtrl?.setValue(this.currentRegion?.defaultCity || '');
    }
  }

  private regionOfCity(city: string): Region | undefined {
    const n = (city || '').toLowerCase();
    return this.regions.find(r => r.cities.some(c => c.toLowerCase() === n));
  }

  // ===== lifecycle =====
  ngOnInit(): void {
    this.form.get('regionKey')?.setValue(this.defaultRegionKey);
    this.setRegionByKey(this.defaultRegionKey);
    this.form.get('regionKey')?.valueChanges.subscribe(val => this.setRegionByKey(val as string));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && this.initialData) {
      this.form.patchValue(this.initialData as any);

      const initialCity = (this.initialData.city || this.initialData.location || '').trim();
      const r = this.regionOfCity(initialCity);
      const regionKey = r?.key ?? this.defaultRegionKey;

      this.form.get('regionKey')?.setValue(regionKey, { emitEvent: true });
      this.setRegionByKey(regionKey);

      if (!r && initialCity) {
        this.unknownCity = initialCity;
        this.form.get('location')?.setValue(initialCity);
      }
    }
  }

  // ===== submit =====
  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;

    const v = this.form.value;

    // Region y city para el backend
    const reg = this.regions.find(r => r.key === v.regionKey);
    const regionLabel = reg ? `${reg.name} · ${reg.country}` : '';
    const city = (v.location ?? '').trim();

    // Puedes omitir location y el back la deriva; si quieres mandarla:
    const locationDisplay = city && reg ? `${city} · ${reg.name} · ${reg.country}` : city || regionLabel || '';

    const payload: PropertyRequestDto = {
      title: (v.title ?? '').trim(),
      description: (v.description ?? '').trim(),

      region: regionLabel,
      city,
      location: locationDisplay || null,

      pricePerNight: Number(v.pricePerNight),
      currency: (environment as any).defaultCurrency ?? 'EUR',

      bedrooms: v.bedrooms ?? null,
      bathrooms: v.bathrooms ?? null,
      maxGuests: v.maxGuests ?? null,
      beds: v.beds ?? null,
      areaM2: v.areaSqm ?? null,

      propertyType: v.propertyType ? (String(v.propertyType).toUpperCase() as PropertyType) : null,
      viewType:     v.view ? (String(v.view).toUpperCase() as ViewType) : null,

      parking: !!v.parking,
      petFriendly: !!v.petFriendly,
      smokingAllowed: !!v.smokingAllowed,
      workspace: !!v.dedicatedWorkspace,
      airConditioning: !!v.airConditioning,
      heating: !!v.heating,
      pool: !!v.pool,
      hotTub: !!v.hotTub,
      garden: !!v.garden,
      terrace: !!v.terrace,
      balcony: !!v.balcony,
      accessible: !!v.accessible,

      wifiMbps: v.wifiMbps ?? null,
      minNights: v.minNights ?? null,
      checkInFrom: v.checkInFrom || null,
      checkOutUntil: v.checkOutUntil || null,
      distanceToBeachKm: v.beachKm ?? null,
      distanceToCenterKm: v.centerKm ?? null,

      coverUrl: v.coverUrl?.trim() || null
    };

    const req$ = this.id
      ? this.api.updateProperty(this.id, payload)
      : this.api.createProperty(payload);

    req$
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.snack.open(this.id ? 'Property updated' : 'Property created', 'Close', { duration: 2500 });
          this.router.navigate(['/my-properties']);
        },
        error: (err) => {
          console.error('Create/Update failed', err);
          this.snack.open('Operation failed. Please try again.', 'Close', { duration: 3500 });
        }
      });
  }
}
