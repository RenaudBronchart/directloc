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
import { Page, Property } from '../../../models/property.model';
import { PropertyRowCardComponent } from '../../../components/property-row-card/property-row-card.component';

/** Type local pour la barre top */
type TopSearchParams = {
  q?: string;
  checkIn?: Date | null;
  checkOut?: Date | null;
  adults?: number;
  children?: number;
  rooms?: number;
};

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
  items: Property[] = [];
  total = 0;

  // pagination
  pageIndex = 0;
  pageSize = 12;

  // tri
  sort: 'newest' | 'price_asc' | 'price_desc' = 'newest';

  // filtres (on garde checkIn/out pour futur)
  form = this.fb.group({
    q: [''],
    checkIn: [null as Date | null],
    checkOut: [null as Date | null],
    adults: [2],
    children: [0],
    rooms: [1],
    minPrice: [null as number | null],
    maxPrice: [null as number | null],
    bedrooms: [null as number | null],
    pool: [false],
    wifi: [false],
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
    // hydrate depuis l’URL
    const qp = this.route.snapshot.queryParamMap;

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
      minPrice: qp.get('minPrice') ? +(qp.get('minPrice')!) : null,
      maxPrice: qp.get('maxPrice') ? +(qp.get('maxPrice')!) : null,
      pool: (qp.get('pool') ?? 'false') === 'true',
      wifi: (qp.get('wifi') ?? 'false') === 'true',
    }, { emitEvent: false });

    this.pageIndex = +(qp.get('page') ?? 0);
    this.pageSize  = +(qp.get('size') ?? 12);
    this.sort      = (qp.get('sort') as any) ?? 'newest';

    // reload on filters change
    this.form.valueChanges.pipe(debounceTime(250), takeUntil(this.destroy$)).subscribe(() => {
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
    // restore scroll if sidebar was open on mobile
    document.body.style.overflow = '';
  }

  /* ===== UI actions ===== */

  trackById(_: number, p: Property) { return p.id; }

  changeSort(v: 'newest' | 'price_asc' | 'price_desc') {
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

  // handler depuis la barre top
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
    // lock body scroll en sheet mobile
    if (window.innerWidth <= 1000) {
      document.body.style.overflow = this.sidebarOpen ? 'hidden' : '';
    }
  }

  removeChip(c: { key: string }) {
    const defaults: any = {
      q:'', checkIn:null, checkOut:null, adults:2, children:0, rooms:1,
      minPrice:null, maxPrice:null, pool:false, wifi:false
    };
    const patch: any = {}; patch[c.key] = defaults[c.key];
    this.form.patchValue(patch);
  }

  clearAll() {
    this.form.patchValue({
      q:'', checkIn:null, checkOut:null, adults:2, children:0, rooms:1,
      minPrice:null, maxPrice:null, pool:false, wifi:false
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
    if (v.pool) out.push({ key: 'pool', label: 'Pool' });
    if (v.wifi) out.push({ key: 'wifi', label: 'Wi-Fi' });

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
        pool: v.pool, wifi: v.wifi,
        page: this.pageIndex, size: this.pageSize, sort: this.sort
      },
      queryParamsHandling: 'merge'
    });
  }

  private load() {
    this.loading = true;
    const v = this.form.value;

    this.api.getAll({
      q: (v.q || '').trim() || undefined,
      adults: v.adults ?? undefined,
      children: v.children ?? undefined,
      rooms: v.rooms ?? undefined,
      page: this.pageIndex,
      size: this.pageSize
    }).subscribe({
      next: (page: Page<Property>) => {
        this.items = [...page.content].sort((a,b) => {
          if (this.sort === 'price_asc')  return (a.pricePerNight ?? 0) - (b.pricePerNight ?? 0);
          if (this.sort === 'price_desc') return (b.pricePerNight ?? 0) - (a.pricePerNight ?? 0);
          return 0;
        });
        this.total = page.totalElements;
        this.buildChips();
        this.loading = false;
      },
      error: () => { this.items = []; this.total = 0; this.loading = false; }
    });
  }
}
