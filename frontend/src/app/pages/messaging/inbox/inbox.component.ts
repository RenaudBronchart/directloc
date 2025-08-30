import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { finalize } from 'rxjs/operators';

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
  placeholder = 'assets/placeholder.webp';

  ngOnInit() {
    this.svc.conversations(0, 30)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: list => { this.items = list ?? []; },
        error: () => { this.error = true; }
      });
  }

  openThread(c: ConversationListItem) {
    this.router.navigate(['/messages', c.id], {
      queryParams: { title: c.propertyTitle, other: c.otherUserEmail }
    });
  }

  // Fallback to placeholder once, avoiding infinite loop
  imgError(evt: Event) {
    const img = evt.target as HTMLImageElement;
    if (img && img.src !== location.origin + '/' + this.placeholder) {
      img.src = this.placeholder;
    }
  }

  trackId = (_: number, c: ConversationListItem) => c.id;
}
