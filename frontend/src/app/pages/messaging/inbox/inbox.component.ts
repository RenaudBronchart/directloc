import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { MessagingService } from '../../../services/messaging.service';
import { ConversationListItem } from '../../../models/messaging.model';

@Component({
  standalone: true,
  selector: 'app-inbox',
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, DatePipe],
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent {
  private svc = inject(MessagingService);
  private router = inject(Router);

  loading = true;
  error = false;
  items: ConversationListItem[] = [];

  ngOnInit() {
    this.svc.conversations(0, 30).subscribe({
      next: list => { this.items = list ?? []; this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  openThread(c: ConversationListItem) {
    // Pasamos info opcional al hilo (para cabecera)
    this.router.navigate(['/messages', c.id], {
      queryParams: { title: c.propertyTitle, other: c.otherUserEmail }
    });
  }

  trackId = (_: number, c: ConversationListItem) => c.id;
}
