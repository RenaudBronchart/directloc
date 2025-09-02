// src/app/pages/calendar/calendar-page/block-dialog.component.ts
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
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

import { Subject, finalize, takeUntil } from 'rxjs';

import { CalendarService } from '../../../services/calendar.service';
import { CalendarEventModel } from '../../../models/calendar.model';
import { BlockDialogComponent } from '../block-dialog/block-dialog.component';

@Component({
  standalone: true,
  selector: 'app-calendar-page',
  templateUrl: './calendar-page.component.html',
  styleUrls: ['./calendar-page.component.scss'],
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule,MatInputModule, MatDatepickerModule, MatNativeDateModule,
    MatSnackBarModule, MatDialogModule, MatSelectModule,
    MatDividerModule, MatListModule
  ]
})
export class CalendarPageComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private cal = inject(CalendarService);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  private destroy$ = new Subject<void>();

  loading = false;
  tab: 'host' | 'guest' = 'host';

  events: CalendarEventModel[] = [];

  form = this.fb.group({
    from: [this.firstOfMonth(new Date())],
    to: [this.lastOfMonth(new Date())]
  });

  ngOnInit(): void {
    // recargar al cambiar rango
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.load());
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private firstOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
  private lastOfMonth(d: Date)  { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }

  private ymd(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  changeTab(t: 'host'|'guest') {
    if (this.tab !== t) {
      this.tab = t;
      this.load();
    }
  }

  load(): void {
    const v = this.form.getRawValue();
    const from = this.ymd(v.from!);
    const to   = this.ymd(v.to!);

    this.loading = true;
    const req$ = this.tab === 'host' ? this.cal.host(from, to) : this.cal.guest(from, to);

    req$.pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: list => { this.events = this.sort(list); },
        error: () => {
          this.events = [];
          this.snack.open('Could not load calendar.', 'Close', { duration: 2500 });
        }
      });
  }

  private sort(list: CalendarEventModel[]): CalendarEventModel[] {
    return [...list].sort(
      (a, b) => a.start.getTime() - b.start.getTime()
        || a.propertyTitle.localeCompare(b.propertyTitle)
    );
  }

  /** Agrupa por propiedad para pintar en secciones */
  get groupedByProperty(): Array<{ propertyId: string; propertyTitle: string; items: CalendarEventModel[] }> {
    const map = new Map<string, { propertyId: string; propertyTitle: string; items: CalendarEventModel[] }>();
    for (const ev of this.events) {
      const key = `${ev.propertyId}::${ev.propertyTitle}`;
      if (!map.has(key)) map.set(key, { propertyId: ev.propertyId, propertyTitle: ev.propertyTitle, items: [] });
      map.get(key)!.items.push(ev);
    }
    return Array.from(map.values());
  }

  newBlock(propertyId?: string) {
    const ref = this.dialog.open(BlockDialogComponent, {
      data: { propertyId: propertyId ?? null },
      width: '480px'
    });
    ref.afterClosed().subscribe(created => {
      if (created) {
        this.snack.open('Block created.', 'Close', { duration: 1500 });
        this.load();
      }
    });
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
    const from = this.form.controls.from.value!;
    const to   = this.form.controls.to.value!;
    const ms = to.getTime() - from.getTime();
    this.form.patchValue({ from: new Date(from.getTime() - ms), to: new Date(to.getTime() - ms) });
  }

  rangeNext() {
    const from = this.form.controls.from.value!;
    const to   = this.form.controls.to.value!;
    const ms = to.getTime() - from.getTime();
    this.form.patchValue({ from: new Date(from.getTime() + ms), to: new Date(to.getTime() + ms) });
  }
}
