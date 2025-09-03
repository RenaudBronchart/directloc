import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';

import { debounceTime, Subject, takeUntil } from 'rxjs';

import { SearchBarComponent } from '../../../components/search-bar/search-bar.component';
import { PropertyService } from '../../../services/property.service';
import { PageModel } from '../../../models/page.model';
import { PropertyModel } from '../../../models/property.model';
import { PropertyRowCardComponent } from '../../../components/property-row-card/property-row-card.component';

/** Top search bar output type (from app-search-bar) */
type TopSearchParams = {
  q?: string;
  checkIn?: Date | null;
  checkOut?: Date | null;
  adults?: number;
  children?: number;
  rooms?: number;
};

/** Sort UI → backend mapping */
type SortKey = 'newest' | 'price_asc' | 'price_desc';
const toSortByEnum = (s: SortKey) =>
  s === 'price_asc'  ? 'PRICE_ASC' :
    s === 'price_desc' ? 'PRICE_DESC' : 'NEWEST';

@Component({
  standalone: true,
  selector: 'app-property-list',
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatCheckboxModule, MatButtonModule,
    MatPaginatorModule, MatChipsModule,
    PropertyRowCardComponent, SearchBarComponent,
  ],
  templateUrl: './property-list.component.html',
  styleUrls: ['./property-list.component.scss']
})
export class PropertyListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  loading = true;
  items: PropertyModel[] = [];
  total = 0;

  // pagination
  pageIndex = 0;
  pageSize = 12;

  // sorting (client → server mapped)
  sort: SortKey = 'newest';

  /** Small catalogs for selects – keep names aligned with backend enums */
  propertyTypes: string[] = ['APARTMENT','HOUSE','STUDIO','VILLA','CABIN','COTTAGE','ROOM'];
  viewTypes: string[] = ['SEA','MOUNTAIN','CITY','GARDEN','PARK','RIVER','FOREST','LAKE'];

  // All filters handled on this page (dates come from top bar too)
  form = this.fb.group({
    q: [''],

    checkIn: [null as Date | null],
    checkOut: [null as Date | null],

    adults: [2],
    children: [0],
    rooms: [1],

    minPrice: [null as number | null],
    maxPrice: [null as number | null],

    bedroomsMin: [null as number | null],
    bathroomsMin: [null as number | null],
    bedsMin: [null as number | null],
    maxGuestsMin: [null as number | null],
    areaM2Min: [null as number | null],
    minNightsMin: [null as number | null],

    maxDistCenterKm: [null as number | null],
    maxDistBeachKm: [null as number | null],

    wifiMin: [null as number | null],

    propertyType: [null as string | null],
    viewType: [null as string | null],

    // amenities
    pool: [false],
    parking: [false],
    petFriendly: [false],
    smokingAllowed: [false],
    garden: [false],
    terrace: [false],
    balcony: [false],
    hotTub: [false],
    airConditioning: [false],
    heating: [false],
    accessible: [false],
    workspace: [false],
  });

  chips: Array<{ key: string; label: string }> = [];
  sidebarOpen = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private api: PropertyService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Hydrate from URL (defensively parse numbers)
    const qp = this.route.snapshot.queryParamMap;
    const num  = (k: string) => (qp.get(k) !== null ? Number(qp.get(k)) : null);
    const bool = (k: string) => (qp.get(k) ?? 'false') === 'true';

    const ciStr = qp.get('checkIn');
    const coStr = qp.get('checkOut');
    const ci = ciStr ? new Date(ciStr) : null;
    const co = coStr ? new Date(coStr) : null;

    this.form.patchValue({
      q: qp.get('q') ?? '',
      checkIn: ci,
      checkOut: co,
      adults: +(qp.get('adults') ?? 2),
      children: +(qp.get('children') ?? 0),
      rooms: +(qp.get('rooms') ?? 1),

      minPrice: num('minPrice'),
      maxPrice: num('maxPrice'),

      bedroomsMin: num('bedroomsMin'),
      bathroomsMin: num('bathroomsMin'),
      bedsMin: num('bedsMin'),
      maxGuestsMin: num('maxGuestsMin'),
      areaM2Min: num('areaM2Min'),
      minNightsMin: num('minNightsMin'),

      maxDistCenterKm: num('maxDistCenterKm'),
      maxDistBeachKm: num('maxDistBeachKm'),

      wifiMin: num('wifiMin'),

      propertyType: qp.get('propertyType'),
      viewType: qp.get('viewType'),

      pool: bool('pool'),
      parking: bool('parking'),
      petFriendly: bool('petFriendly'),
      smokingAllowed: bool('smokingAllowed'),
      garden: bool('garden'),
      terrace: bool('terrace'),
      balcony: bool('balcony'),
      hotTub: bool('hotTub'),
      airConditioning: bool('airConditioning'),
      heating: bool('heating'),
      accessible: bool('accessible'),
      workspace: bool('workspace'),
    }, { emitEvent: false });

    this.pageIndex = +(qp.get('page') ?? 0);
    this.pageSize  = +(qp.get('size') ?? 12);
    this.sort      = (qp.get('sort') as SortKey) ?? 'newest';

    // auto-reload on any filter change
    this.form.valueChanges
      .pipe(debounceTime(250), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageIndex = 0;
        this.pushState();
        this.buildChips();
        this.load();
      });

    this.buildChips();
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next(); this.destroy$.complete();
    document.body.style.overflow = '';
  }

  /* ===== UI actions ===== */

  trackById(_: number, p: PropertyModel) { return p.id; }

  changeSort(v: SortKey) {
    this.sort = v;
    this.pageIndex = 0;
    this.pushState();
    this.load();
  }

  pageChange(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.pushState();
    this.load();
  }

  onTopSearch(params: TopSearchParams) {
    this.form.patchValue({
      q: params.q ?? '',
      checkIn: params.checkIn ?? null,
      checkOut: params.checkOut ?? null,
      adults: params.adults ?? 2,
      children: params.children ?? 0,
      rooms: params.rooms ?? 1,
    }, { emitEvent: false });

    this.pageIndex = 0;
    this.pushState();
    this.buildChips();
    this.load();
  }

  toggleFilters() {
    this.sidebarOpen = !this.sidebarOpen;
    if (window.innerWidth <= 1000) {
      document.body.style.overflow = this.sidebarOpen ? 'hidden' : '';
    }
  }

  removeChip(c: { key: string }) {
    // Defaults used when clearing a single chip
    const defaults: any = {
      q:'', checkIn:null, checkOut:null,
      adults:2, children:0, rooms:1,
      minPrice:null, maxPrice:null,
      bedroomsMin:null, bathroomsMin:null, bedsMin:null,
      maxGuestsMin:null, areaM2Min:null, minNightsMin:null,
      maxDistCenterKm:null, maxDistBeachKm:null,
      wifiMin:null, propertyType:null, viewType:null,
      pool:false, parking:false, petFriendly:false, smokingAllowed:false,
      garden:false, terrace:false, balcony:false, hotTub:false,
      airConditioning:false, heating:false, accessible:false, workspace:false
    };
    const patch: any = {}; patch[c.key] = defaults[c.key];
    this.form.patchValue(patch);
  }

  clearAll() {
    this.form.reset({
      q:'',
      checkIn:null, checkOut:null,
      adults:2, children:0, rooms:1,
      minPrice:null, maxPrice:null,
      bedroomsMin:null, bathroomsMin:null, bedsMin:null,
      maxGuestsMin:null, areaM2Min:null, minNightsMin:null,
      maxDistCenterKm:null, maxDistBeachKm:null,
      wifiMin:null, propertyType:null, viewType:null,
      pool:false, parking:false, petFriendly:false, smokingAllowed:false,
      garden:false, terrace:false, balcony:false, hotTub:false,
      airConditioning:false, heating:false, accessible:false, workspace:false
    }, { emitEvent: false });

    this.pageIndex = 0;
    this.pushState();
    this.buildChips();
    this.load();
  }

  /* ===== Helpers ===== */

  private formatDateShort(d: Date): string {
    return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  get summaryText(): string {
    const v = this.form.value;
    const parts: string[] = [];

    parts.push(`${this.total} accommodations`);
    parts.push((v.q || '').trim() || 'Anywhere');

    if (v.checkIn && v.checkOut) {
      parts.push(`${this.formatDateShort(v.checkIn)} – ${this.formatDateShort(v.checkOut)}`);
    }

    const a = v.adults ?? 0;
    const c = v.children ?? 0;
    const r = v.rooms ?? 0;
    parts.push(
      `${a} ${a === 1 ? 'adult' : 'adults'}, ` +
      `${c} ${c === 1 ? 'child' : 'children'}, ` +
      `${r} ${r === 1 ? 'room' : 'rooms'}`
    );

    return parts.join(' • ');
  }

  private buildChips() {
    const v = this.form.value;
    const out: Array<{ key: string; label: string }> = [];

    if (v.q) out.push({ key: 'q', label: v.q });

    if (v.checkIn && v.checkOut) {
      out.push({ key: 'checkIn',  label: `Check-in ${new Date(v.checkIn).toLocaleDateString()}` });
      out.push({ key: 'checkOut', label: `Check-out ${new Date(v.checkOut).toLocaleDateString()}` });
    }

    const adults   = v.adults   ?? 0;
    const children = v.children ?? 0;
    const rooms    = v.rooms    ?? 0;
    if (adults && adults !== 2)   out.push({ key: 'adults',   label: `${adults} ${adults > 1 ? 'adults' : 'adult'}` });
    if (children > 0)             out.push({ key: 'children', label: `${children} ${children > 1 ? 'children' : 'child'}` });
    if (rooms && rooms !== 1)     out.push({ key: 'rooms',    label: `${rooms} ${rooms > 1 ? 'rooms' : 'room'}` });

    if (v.minPrice != null) out.push({ key: 'minPrice', label: `€${v.minPrice}+` });
    if (v.maxPrice != null) out.push({ key: 'maxPrice', label: `≤ €${v.maxPrice}` });

    if (v.bedroomsMin != null)  out.push({ key: 'bedroomsMin',  label: `${v.bedroomsMin}+ bd` });
    if (v.bathroomsMin != null) out.push({ key: 'bathroomsMin', label: `${v.bathroomsMin}+ ba` });
    if (v.bedsMin != null)      out.push({ key: 'bedsMin',      label: `${v.bedsMin}+ beds` });
    if (v.maxGuestsMin != null) out.push({ key: 'maxGuestsMin', label: `${v.maxGuestsMin}+ guests` });
    if (v.areaM2Min != null)    out.push({ key: 'areaM2Min',    label: `≥ ${v.areaM2Min} m²` });
    if (v.minNightsMin != null) out.push({ key: 'minNightsMin', label: `≥ ${v.minNightsMin} nights` });

    if (v.maxDistCenterKm != null) out.push({ key: 'maxDistCenterKm', label: `≤ ${v.maxDistCenterKm} km center` });
    if (v.maxDistBeachKm != null)  out.push({ key: 'maxDistBeachKm',  label: `≤ ${v.maxDistBeachKm} km beach` });

    if (v.wifiMin != null) out.push({ key: 'wifiMin', label: `Wi-Fi ≥ ${v.wifiMin} Mbps` });

    if (v.propertyType) out.push({ key: 'propertyType', label: v.propertyType });
    if (v.viewType)     out.push({ key: 'viewType',     label: v.viewType });

    // amenities: only show those that are true
    ([
      ['pool','Pool'], ['parking','Parking'], ['petFriendly','Pet friendly'],
      ['smokingAllowed','Smoking'], ['garden','Garden'], ['terrace','Terrace'],
      ['balcony','Balcony'], ['hotTub','Hot tub'], ['airConditioning','A/C'],
      ['heating','Heating'], ['accessible','Accessible'], ['workspace','Workspace']
    ] as const).forEach(([k, lbl]) => {
      if ((v as any)[k]) out.push({ key: k, label: lbl });
    });

    this.chips = out;
  }

  private toDateParam(d: Date | null | undefined): string | null {
    if (!d) return null;
    const x = new Date(d);
    return x.toISOString().split('T')[0];
  }

  private pushState() {
    const v = this.form.value;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: v.q || null,
        checkIn: this.toDateParam(v.checkIn),
        checkOut: this.toDateParam(v.checkOut),
        adults: v.adults, children: v.children, rooms: v.rooms,

        minPrice: v.minPrice, maxPrice: v.maxPrice,
        bedroomsMin: v.bedroomsMin, bathroomsMin: v.bathroomsMin, bedsMin: v.bedsMin,
        maxGuestsMin: v.maxGuestsMin, areaM2Min: v.areaM2Min, minNightsMin: v.minNightsMin,
        maxDistCenterKm: v.maxDistCenterKm, maxDistBeachKm: v.maxDistBeachKm,
        wifiMin: v.wifiMin,
        propertyType: v.propertyType, viewType: v.viewType,

        pool: v.pool, parking: v.parking, petFriendly: v.petFriendly, smokingAllowed: v.smokingAllowed,
        garden: v.garden, terrace: v.terrace, balcony: v.balcony, hotTub: v.hotTub,
        airConditioning: v.airConditioning, heating: v.heating, accessible: v.accessible, workspace: v.workspace,

        page: this.pageIndex, size: this.pageSize, sort: this.sort
      },
      queryParamsHandling: 'merge'
    });
  }
  private numOrU(v: any): number | undefined {
    const n = v === '' || v == null ? NaN : Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  private boolTrue(v: any): true | undefined {
    return v === true ? true : undefined;
  }

  private load() {
    this.loading = true;
    const v = this.form.value;

    this.api.getAll({
      q: (v.q || '').trim() || undefined,

      adults: this.numOrU(v.adults),
      children: this.numOrU(v.children),
      rooms: this.numOrU(v.rooms),

      minPrice: this.numOrU(v.minPrice),
      maxPrice: this.numOrU(v.maxPrice),

      // 🔧 Space & stay: estos faltaban
      bedroomsMin: this.numOrU(v.bedroomsMin),
      bathroomsMin: this.numOrU(v.bathroomsMin),
      bedsMin: this.numOrU(v.bedsMin),

      // ⚠️ Decide y unifica: ¿"maxGuestsMin" o "guestsMin"?
      // Mantengo "maxGuestsMin" porque es el del formulario:
      maxGuestsMin: this.numOrU(v.maxGuestsMin),

      areaM2Min: this.numOrU(v.areaM2Min),
      minNightsMin: this.numOrU(v.minNightsMin),

      maxDistCenterKm: this.numOrU(v.maxDistCenterKm),
      maxDistBeachKm: this.numOrU(v.maxDistBeachKm),

      wifiMin: this.numOrU(v.wifiMin),

      propertyType: v.propertyType || undefined,
      viewType: v.viewType || undefined,

      // Amenities: solo si están marcados
      pool: this.boolTrue(v.pool),
      parking: this.boolTrue(v.parking),
      petFriendly: this.boolTrue(v.petFriendly),
      smokingAllowed: this.boolTrue(v.smokingAllowed),
      garden: this.boolTrue(v.garden),
      terrace: this.boolTrue(v.terrace),
      balcony: this.boolTrue(v.balcony),
      hotTub: this.boolTrue(v.hotTub),
      airConditioning: this.boolTrue(v.airConditioning),
      heating: this.boolTrue(v.heating),
      accessible: this.boolTrue(v.accessible),
      workspace: this.boolTrue(v.workspace),

      checkIn: v.checkIn ?? undefined,
      checkOut: v.checkOut ?? undefined,

      sortBy: toSortByEnum(this.sort),
      page: this.pageIndex,
      size: this.pageSize
    }).subscribe({
      next: (page) => {
        this.items = page.content;
        this.total = page.totalElements;
        this.buildChips();
        this.loading = false;
      },
      error: () => { this.items = []; this.total = 0; this.loading = false; }
    });
  }
}
