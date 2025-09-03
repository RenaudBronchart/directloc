import { Component, OnDestroy, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { Subject, finalize, takeUntil, forkJoin, of, catchError, map } from 'rxjs';
import { CalendarService } from '../../../services/calendar.service';
import { CalendarEventModel } from '../../../models/calendar.model';
import { BlockDialogComponent } from '../block-dialog/block-dialog.component';
import { BookingService } from '../../../services/booking.service';
import { BookingModel } from '../../../models/booking.model';
import { PropertyService } from '../../../services/property.service';

import { CalendarMonthComponent } from '../   calendar-month/calendar-month.component';

@Component({
  standalone: true,
  selector: 'app-calendar-page',
  templateUrl: './calendar-page.component.html',
  styleUrls: ['./calendar-page.component.scss'],
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule,
    MatSnackBarModule, MatDialogModule, MatSelectModule,
    MatDividerModule, MatListModule,
    CalendarMonthComponent
  ]
})
export class CalendarPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder);
  private cal = inject(CalendarService);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private bookingsSvc = inject(BookingService);
  private props = inject(PropertyService);  // 👈 aquí

  private destroy$ = new Subject<void>();

  loading = true;
  tab: 'host' | 'guest' = 'guest'; // por defecto guest
  canHost = false;                 // si no tiene props, ocultamos la pestaña Host

  events: CalendarEventModel[] = [];
  private myBookings: BookingModel[] = [];

  form = this.fb.group({
    from: [this.firstOfMonth(new Date())],
    to: [this.lastOfMonth(new Date())]
  });

  ngOnInit(): void {
    // 1) ¿Tiene propiedades?
    this.detectCanHost().subscribe((v: boolean) => {
      this.canHost = v;
      if (!v) this.tab = 'guest';

      // 2) Ya podemos escuchar cambios de rango y cargar
      this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.load());
      this.load();
    });
  }
  ngAfterViewInit(): void {}
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  // -------- fechas / helpers --------
  private firstOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
  private lastOfMonth(d: Date)  { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
  private stripTime(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  private sameDay(a: Date, b: Date) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
  private ymd(d: Date): string {
    const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,'0'); const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  private overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
    const aS = this.stripTime(aStart).getTime();
    const aE = this.stripTime(aEnd).getTime();
    const bS = this.stripTime(bStart).getTime();
    const bE = this.stripTime(bEnd).getTime();
    return aS <= bE && bS <= aE;
  }
  nights(ev: CalendarEventModel): number {
    const ms = this.stripTime(ev.end).getTime() - this.stripTime(ev.start).getTime();
    return Math.max(1, Math.round(ms / 86400000));
  }

  // ✅ Usa tu PropertyService para saber si tiene props
  private detectCanHost() {
    return this.props.getMyProperties().pipe(
      map(list => Array.isArray(list) && list.length > 0),
      catchError(() => of(false))
    );
  }

  // -------- UI --------
  changeTab(t: 'host'|'guest') {
    if (t === 'host' && !this.canHost) return;
    if (this.tab !== t) { this.tab = t; setTimeout(() => this.load(), 0); }
  }

  onMonthChange(e: { from: Date; to: Date }) {
    const toInclusive = new Date(e.to.getTime() - 86400000);
    const curFrom = this.form.controls.from.value!;
    const curTo   = this.form.controls.to.value!;
    if (this.sameDay(curFrom, e.from) && this.sameDay(curTo, toInclusive)) return;
    this.form.patchValue({ from: e.from, to: toInclusive }, { emitEvent: false });
    setTimeout(() => this.load(), 0);
  }

  get upcomingBookings(): CalendarEventModel[] {
    if (this.tab !== 'guest') return [];
    const today = this.stripTime(new Date());
    return this.myBookings
      .filter(b => new Date(b.checkIn) >= today)
      .sort((a,b) => +new Date(a.checkIn) - +new Date(b.checkIn))
      .slice(0, 10)
      .map(b => this.bookingToEvent(b));
  }

  // -------- data --------
  load(): void {
    const v = this.form.getRawValue();
    const fromMonth = this.ymd(v.from!);
    const toMonth   = this.ymd(v.to!);

    const range$ = (this.tab === 'host'
        ? this.cal.host(fromMonth, toMonth)
        : this.cal.guest(fromMonth, toMonth)
    ).pipe(catchError(() => of([] as CalendarEventModel[])));

    const my$ = this.bookingsSvc.my().pipe(catchError(() => of([] as BookingModel[])));

    this.loading = true;

    forkJoin<[CalendarEventModel[], BookingModel[]]>([range$, my$])
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ([rangeEvents, allMy]) => {
          this.myBookings = allMy ?? [];

          const monthStart = v.from!;
          const monthEnd   = v.to!;
          const monthBookings = this.myBookings
            .filter(b => this.overlaps(new Date(b.checkIn), new Date(b.checkOut), monthStart, monthEnd))
            .map(b => this.bookingToEvent(b));

          this.events = this.tab === 'host'
            ? this.sort(rangeEvents ?? [])
            : this.sort(monthBookings);
        },
        error: () => {
          this.events = [];
          this.myBookings = [];
          this.snack.open('Could not load calendar.', 'Close', { duration: 2500 });
        }
      });
  }

  private sort(list: CalendarEventModel[]): CalendarEventModel[] {
    return [...list].sort(
      (a, b) => a.start.getTime() - b.start.getTime()
        || (a.propertyTitle || '').localeCompare(b.propertyTitle || '')
    );
  }

  private bookingToEvent(b: BookingModel): CalendarEventModel {
    const start = new Date(b.checkIn);
    const end   = new Date(b.checkOut);
    return {
      isBooking: true,
      isBlock: false,
      bookingId: b.id ?? null,
      blockId: null,
      title: b.propertyTitle ?? 'Booking',
      status: String(b.status || '').toUpperCase(),
      start, end,
      propertyId: String((b as any).propertyId ?? (b as any).property?.id ?? ''),
      propertyTitle: b.propertyTitle ?? (b as any).property?.title ?? 'Property'
    } as CalendarEventModel;
  }

  statusLabel(status: unknown): string {
    const s = String(status || '').toUpperCase();
    if (s === 'REQUESTED') return 'Requested';
    if (s === 'ACCEPTED' || s === 'APPROVED') return 'Accepted';
    if (s === 'REJECTED' || s === 'DECLINED') return 'Rejected';
    if (s === 'CANCELLED' || s === 'CANCELED') return 'Cancelled';
    return s || '—';
  }
  statusClass(status: unknown): string {
    const s = String(status || '').toUpperCase();
    if (s === 'REQUESTED') return 'req';
    if (s === 'ACCEPTED' || s === 'APPROVED') return 'acc';
    if (s === 'REJECTED' || s === 'DECLINED') return 'rej';
    if (s === 'CANCELLED' || s === 'CANCELED') return 'can';
    return '';
  }

  newBlock(propertyId?: string) {
    const ref = this.dialog.open(BlockDialogComponent, { data: { propertyId: propertyId ?? null }, width: '480px' });
    ref.afterClosed().subscribe(created => { if (created) { this.snack.open('Block created.', 'Close', { duration: 1500 }); this.load(); } });
  }
  deleteBlock(ev: CalendarEventModel) {
    if (!ev.isBlock || !ev.blockId) return;
    if (!confirm('Delete this block?')) return;
    this.cal.deleteBlock(ev.blockId).subscribe({
      next: () => { this.snack.open('Block deleted.', 'Close', { duration: 1200 }); this.load(); },
      error: () => { this.snack.open('Could not delete block.', 'Close', { duration: 2500 }); }
    });
  }

  rangePrev() {
    const from = this.form.controls.from.value!; const to = this.form.controls.to.value!;
    const ms = to.getTime() - from.getTime();
    this.form.patchValue({ from: new Date(from.getTime() - ms), to: new Date(to.getTime() - ms) });
  }
  rangeNext() {
    const from = this.form.controls.from.value!; const to = this.form.controls.to.value!;
    const ms = to.getTime() - from.getTime();
    this.form.patchValue({ from: new Date(from.getTime() + ms), to: new Date(to.getTime() + ms) });
  }
}
