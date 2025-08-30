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

  messages: ChatMessage[] = [];
  loading = true;
  sending = false;

  headerTitle: string | null = null;   // opcional (titulo en header)
  otherEmail:  string | null = null;   // opcional (subtitulo)
  archived = false;

  form = this.fb.group({
    body: ['', [Validators.required, Validators.minLength(1)]]
  });

  ngOnInit() {
    // marcar leído
    this.svc.markRead(this.id).subscribe();

    // datos opcionales para el header vía query params
    const qp = this.route.snapshot.queryParamMap;
    this.headerTitle = qp.get('title');
    this.otherEmail  = qp.get('other');

    // polling + autoscroll
    interval(3000).pipe(
      startWith(0),
      switchMap(() => this.svc.thread(this.id)), // <- debe devolver ChatMessage[]
      tap(() => this.loading = false)
    ).subscribe(list => {
      const wasAtBottom = this.isAtBottom();
      this.messages = list ?? [];
      if (wasAtBottom) this.scrollToBottom();
    });
  }

  // ===== Enviar =====
  send() {
    if (this.form.invalid || this.sending) return;
    const body = (this.form.value.body ?? '').trim();
    if (!body) return;

    this.sending = true;
    this.svc.send(this.id, body).subscribe({
      next: (msg) => {
        this.messages = [...this.messages, msg];
        this.form.reset();
        this.sending = false;
        this.scrollToBottom();
      },
      error: () => { this.sending = false; }
    });
  }

  // ===== Acciones (si usas los endpoints) =====
  archive()   { this.svc.archive(this.id).subscribe(() => this.archived = true); }
  unarchive() { this.svc.unarchive(this.id).subscribe(() => this.archived = false); }

  // ===== UX helpers =====
  trackId = (_: number, m: ChatMessage) => m.id;

  isAtBottom(): boolean {
    const el = this.scrollRegion?.nativeElement;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 64;
    // margen de 64px para no hacer scroll si el usuario está leyendo arriba
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
    if (ev.key === 'Enter' && !ev.shiftKey) {
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
}
