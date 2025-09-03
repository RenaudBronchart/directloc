import { Component, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { MessagingService } from '../../../services/messaging.service';
import { ChatMessage } from '../../../models/messaging.model';

import { interval, startWith, switchMap, tap } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-thread',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss']
})
export class ThreadComponent {
  private route = inject(ActivatedRoute);
  private svc = inject(MessagingService);
  private fb = inject(FormBuilder);

  id = Number(this.route.snapshot.paramMap.get('id')!);

  @ViewChild('scrollRegion') scrollRegion!: ElementRef<HTMLDivElement>;
  @ViewChild('bodyInput') bodyInput!: ElementRef<HTMLTextAreaElement>;

  messages: ChatMessage[] = [];
  loading = true;
  sending = false;

  headerTitle: string | null = null;
  otherEmail:  string | null = null;
  otherPhone:  string | null = null;
  archived = false;

  scrolled = false;
  showJump = false;

  // ---- Booking meta (desde query params) ----
  booking = {
    bookingId: null as number | null,
    checkIn: null as string | null,
    checkOut: null as string | null,
    status: null as string | null,
    totalPrice: null as number | null,
    currency: 'EUR' as string | null,

    get available() {
      return !!(this.checkIn || this.checkOut || this.status || this.totalPrice != null);
    },
    get nights(): number | null {
      if (!this.checkIn || !this.checkOut) return null;
      const a = new Date(this.checkIn).getTime();
      const b = new Date(this.checkOut).getTime();
      if (isNaN(a) || isNaN(b)) return null;
      return Math.max(0, Math.round((b - a) / 86400000));
    },
    get dateRange(): string {
      const ci = this.checkIn, co = this.checkOut;
      if (!ci || !co) return '';
      const inD  = new Date(ci), outD = new Date(co);
      const sameMonth = inD.getFullYear() === outD.getFullYear() && inD.getMonth() === outD.getMonth();
      const m1 = inD.toLocaleString(undefined, { month: 'short' });
      const d1 = inD.getDate(), d2 = outD.getDate();
      return sameMonth ? `${m1} ${d1}–${d2}` : `${m1} ${d1} – ${outD.toLocaleString(undefined, { month: 'short' })} ${d2}`;
    },
    get formattedPrice(): string {
      if (this.totalPrice == null) return '';
      const cur = this.currency || 'EUR';
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur }).format(this.totalPrice);
    },
    get isSoon(): boolean {
      if (!this.checkIn) return false;
      const inD = new Date(this.checkIn);
      const today = new Date(); today.setHours(0,0,0,0);
      const diff = Math.round((inD.getTime() - today.getTime()) / 86400000);
      return diff >= 0 && diff <= 7;
    }
  };

  form = this.fb.group({
    body: ['', [Validators.required, Validators.minLength(1)]]
  });

  get canSend(): boolean {
    const v = (this.form.value.body ?? '').trim();
    return v.length > 0 && !this.sending;
  }

  ngOnInit() {
    // marca leído
    this.svc.markRead(this.id).subscribe();

    // datos para header/banner desde query params
    const qp = this.route.snapshot.queryParamMap;
    this.headerTitle    = qp.get('title');
    this.otherEmail     = qp.get('other');
    this.otherPhone     = qp.get('phone'); // opcional
    this.booking.bookingId  = qp.get('bookingId') ? Number(qp.get('bookingId')) : null;
    this.booking.checkIn    = qp.get('checkIn');
    this.booking.checkOut   = qp.get('checkOut');
    this.booking.status     = qp.get('status');
    this.booking.totalPrice = qp.get('totalPrice') != null ? Number(qp.get('totalPrice')) : null;
    this.booking.currency   = qp.get('currency') || 'EUR';

    // polling + autoscroll + botón de salto
    interval(3000).pipe(
      startWith(0),
      switchMap(() => this.svc.thread(this.id)),
      tap(() => this.loading = false)
    ).subscribe(list => {
      const wasAtBottom = this.isAtBottom();
      const prevLen = this.messages.length;
      this.messages = list ?? [];
      if (wasAtBottom) {
        this.scrollToBottom();
        this.showJump = false;
      } else if (this.messages.length > prevLen) {
        this.showJump = true;
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => { try { this.bodyInput.nativeElement.focus(); } catch {} }, 0);
  }

  // ===== Enviar =====
  send() {
    if (!this.canSend) return;
    const body = (this.form.value.body ?? '').trim();
    if (!body) return;

    this.sending = true;
    this.svc.send(this.id, body).subscribe({
      next: (msg) => {
        this.messages = [...this.messages, msg];
        this.form.reset();
        this.sending = false;
        this.scrollToBottom();
        this.showJump = false;
      },
      error: () => { this.sending = false; }
    });
  }

  // ===== Acciones =====
  archive()   { this.svc.archive(this.id).subscribe(() => this.archived = true); }
  unarchive() { this.svc.unarchive(this.id).subscribe(() => this.archived = false); }

  // ===== UX helpers =====
  trackId = (_: number, m: ChatMessage) => m.id;

  onScrolled() {
    const el = this.scrollRegion?.nativeElement;
    if (!el) return;
    this.scrolled = el.scrollTop > 2;
    if (this.isAtBottom()) this.showJump = false;
  }

  isAtBottom(): boolean {
    const el = this.scrollRegion?.nativeElement;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 64;
  }

  jumpToBottom(): void {
    this.scrollToBottom();
    this.showJump = false;
  }

  scrollToBottom(): void {
    const el = this.scrollRegion?.nativeElement;
    if (!el) return;
    queueMicrotask(() => el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }));
  }

  autogrow(e: Event) {
    const t = e.target as HTMLTextAreaElement;
    t.style.height = 'auto';
    t.style.height = Math.min(t.scrollHeight, window.innerHeight * 0.34) + 'px';
  }

  onKeydown(ev: KeyboardEvent) {
    if (ev.key === 'Enter' && (ev.shiftKey)) return; // Shift+Enter = nueva línea
    if (ev.key === 'Enter' && (!ev.shiftKey || ev.ctrlKey || ev.metaKey)) {
      ev.preventDefault();
      this.send();
    }
  }

  showDateSeparator(i: number): boolean {
    if (i === 0) return true;
    const prev = this.messages[i - 1].createdAt;
    const curr = this.messages[i].createdAt;
    return !this.isSameDay(prev, curr);
  }

  isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }

  formatDay(d: Date): string {
    const today = new Date();
    const y = new Date(today); y.setDate(today.getDate() - 1);
    if (this.isSameDay(d, today)) return 'Today';
    if (this.isSameDay(d, y))     return 'Yesterday';
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(d);
  }

  copy(value: string) {
    try {
      if ('clipboard' in navigator && (navigator as any).clipboard?.writeText) {
        (navigator as any).clipboard.writeText(value);
      } else {
        const ta = document.createElement('textarea');
        ta.value = value; ta.style.position = 'fixed'; ta.style.left = '-9999px';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      }
    } catch {}
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
}
