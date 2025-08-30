import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MessagingService } from '../../../services/messaging.service';
import { ChatMessage } from '../../../models/messaging.model';
import { interval, map, startWith, switchMap, tap } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-thread',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, DatePipe],
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss']
})
export class ThreadComponent {
  private route = inject(ActivatedRoute);
  private svc = inject(MessagingService);
  private fb = inject(FormBuilder);

  id = Number(this.route.snapshot.paramMap.get('id')!);
  messages: ChatMessage[] = [];
  loading = true;
  sending = false;

  form = this.fb.group({ body: ['', [Validators.required, Validators.minLength(1)]] });

  ngOnInit() {
    // mark as read (fire & forget)
    this.svc.markRead(this.id).subscribe();

    interval(3500).pipe(
      startWith(0),
      switchMap(() => this.svc.thread(this.id, 0, 200)),
      tap(() => this.loading = false),
      map(list => Array.isArray(list) ? list : [])   // blindaje
    ).subscribe(list => this.messages = list);
  }

  send() {
    if (this.form.invalid || this.sending) return;
    const body = this.form.value.body!.trim();
    if (!body) return;
    this.sending = true;
    this.svc.send(this.id, body).subscribe({
      next: (msg) => {
        this.messages = [...this.messages, msg];
        this.form.reset();
        this.sending = false;
      },
      error: () => { this.sending = false; }
    });
  }
}
