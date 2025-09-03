// src/app/pages/messaging/inbox/inbox.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { finalize } from 'rxjs/operators';

import { MessagingService } from '../../../services/messaging.service';
import { ConversationListItem } from '../../../models/messaging.model';
import { AgoPipe } from '../../../pipes/pipe';

type Section = { label: string; items: ConversationListItem[]; offset: number };

@Component({
  standalone: true,
  selector: 'app-inbox',
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, DatePipe, AgoPipe],
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent {
  private svc = inject(MessagingService);
  private router = inject(Router);

  loading = true;
  error = false;
  items: ConversationListItem[] = [];

  // Tabs
  view: 'all' | 'unread' | 'archived' = 'all';

  // Keyboard nav
  activeIndex = 0;

  placeholder = 'assets/placeholder.webp';

  /* ---- Counters ---- */
  get countAll()      { return this.items.filter(i => i.status !== 'ARCHIVED').length; } // “All” = sin archivados
  get countUnread()   { return this.items.filter(i => i.unreadCount > 0 && i.status !== 'ARCHIVED').length; }
  get countArchived() { return this.items.filter(i => i.status === 'ARCHIVED').length; }

  /* ---- Filter by tab ---- */
  private get displayed(): ConversationListItem[] {
    switch (this.view) {
      case 'unread':   return this.items.filter(i => i.unreadCount > 0 && i.status !== 'ARCHIVED');
      case 'archived': return this.items.filter(i => i.status === 'ARCHIVED');
      default:         return this.items.filter(i => i.status !== 'ARCHIVED'); // “All” real
    }
  }

  /* ---- Group by recency ---- */
  get groupedDisplayed(): Section[] {
    const list = this.displayed
      .slice()
      .sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());

    const today: ConversationListItem[] = [];
    const yesterday: ConversationListItem[] = [];
    const earlier: ConversationListItem[] = [];

    const startOfToday = new Date(); startOfToday.setHours(0,0,0,0);
    const startOfYesterday = new Date(startOfToday); startOfYesterday.setDate(startOfToday.getDate() - 1);

    for (const c of list) {
      const t = new Date(c.lastMessageAt || 0);
      if (t >= startOfToday) today.push(c);
      else if (t >= startOfYesterday) yesterday.push(c);
      else earlier.push(c);
    }

    const sections: Section[] = [];
    let offset = 0;
    if (today.length)     { sections.push({ label: 'Today',     items: today,     offset }); offset += today.length; }
    if (yesterday.length) { sections.push({ label: 'Yesterday', items: yesterday, offset }); offset += yesterday.length; }
    if (earlier.length)   { sections.push({ label: 'Earlier',   items: earlier,   offset }); offset += earlier.length; }
    if (!sections.length) { sections.push({ label: '',          items: list,      offset: 0 }); }
    return sections;
  }

  get flatDisplayed(): ConversationListItem[] {
    return this.groupedDisplayed.flatMap(s => s.items);
  }

  /* ---- Load ---- */
  ngOnInit() {
    this.svc.conversations(0, 30)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: list => { this.items = list ?? []; },
        error: () => { this.error = true; }
      });
  }

  /* ---- Actions ---- */
  openThread(c: ConversationListItem) {
    this.router.navigate(['/messages', c.id], {
      queryParams: { title: c.propertyTitle, other: c.otherUserEmail }
    });
  }

  onListKeydown(e: KeyboardEvent) {
    const flat = this.flatDisplayed;
    if (!flat.length) return;

    if (e.key === 'j' || e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeIndex = Math.min(this.activeIndex + 1, flat.length - 1);
    } else if (e.key === 'k' || e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeIndex = Math.max(this.activeIndex - 1, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const c = flat[this.activeIndex];
      if (c) this.openThread(c);
    }
  }

  private reclampActive() {
    const len = this.flatDisplayed.length;
    this.activeIndex = Math.min(this.activeIndex, Math.max(0, len - 1));
  }

  toggleUnread(c: ConversationListItem) {
    c.unreadCount = c.unreadCount > 0 ? 0 : 1;
    // TODO: persist in API if needed
  }

  togglePin(c: ConversationListItem) {
    c.pinned = !c.pinned;
    // TODO: persist in API if needed
  }

  archiveThread(c: ConversationListItem) {
    c.status = 'ARCHIVED';
    this.reclampActive();
    // TODO: persist in API if needed: this.svc.archive(c.id).subscribe()
  }

  unarchiveThread(c: ConversationListItem) {
    c.status = 'OPEN'; // 👈 importante: 'OPEN', no 'ACTIVE'
    this.reclampActive();
    // TODO: persist in API if needed: this.svc.unarchive(c.id).subscribe()
  }

  /* ---- Helpers used in template ---- */
  nights(checkIn?: string | null, checkOut?: string | null): number | null {
    if (!checkIn || !checkOut) return null;
    const a = new Date(checkIn).getTime();
    const b = new Date(checkOut).getTime();
    if (isNaN(a) || isNaN(b)) return null;
    const days = Math.round((b - a) / 86400000);
    return Math.max(0, days);
  }

  dateRangeShort(checkIn?: string | null, checkOut?: string | null): string {
    if (!checkIn || !checkOut) return '';
    const inD  = new Date(checkIn);
    const outD = new Date(checkOut);
    const sameMonth = inD.getFullYear() === outD.getFullYear() && inD.getMonth() === outD.getMonth();

    const m1 = inD.toLocaleString(undefined, { month: 'short' });
    const d1 = inD.getDate();
    const d2 = outD.getDate();

    if (sameMonth) return `${m1} ${d1}–${d2}`;
    const m2 = outD.toLocaleString(undefined, { month: 'short' });
    return `${m1} ${d1} – ${m2} ${d2}`;
  }

  formatMoney(v?: number | null, currency = 'EUR'): string {
    if (v == null) return '';
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(v);
  }

  statusLabel(status: unknown): string {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'REQUESTED': return 'Requested';
      case 'PENDING':   return 'Pending';
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
    if (s === 'REQUESTED' || s === 'PENDING') return 'req';
    if (s === 'ACCEPTED' || s === 'APPROVED') return 'acc';
    if (s === 'REJECTED' || s === 'DECLINED') return 'rej';
    if (s === 'CANCELLED' || s === 'CANCELED') return 'can';
    return '';
  }

  isSoon(c: ConversationListItem): boolean {
    if (!c?.checkIn) return false;
    const inD = new Date(c.checkIn);
    const today = new Date(); today.setHours(0,0,0,0);
    const diff = Math.round((inD.getTime() - today.getTime()) / 86400000);
    return diff >= 0 && diff <= 7;
  }

  /* ---- Image fallback ---- */
  imgError(evt: Event) {
    const img = evt.target as HTMLImageElement | null;
    if (!img) return;
    const ds = img.dataset as DOMStringMap;
    if (!ds['fallback']) { ds['fallback'] = '1'; img.src = this.placeholder; }
  }

  trackId = (_: number, c: ConversationListItem) => c.id;
}
