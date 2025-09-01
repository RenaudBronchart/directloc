import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { finalize } from 'rxjs/operators';

import { MessagingService } from '../../../services/messaging.service';
import { ConversationListItem } from '../../../models/messaging.model';
import { AgoPipe } from '../../../pipes/pipe';

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

  // Tabs state (single source of truth)
  view: 'all' | 'unread' | 'archived' = 'all';

  // Keyboard navigation
  activeIndex = 0;

  placeholder = 'assets/placeholder.webp';

  // Counters for tabs
  get countAll()      { return this.items.length; }
  get countUnread()   { return this.items.filter(i => i.unreadCount > 0 && i.status !== 'ARCHIVED').length; }
  get countArchived() { return this.items.filter(i => i.status === 'ARCHIVED').length; }

  // Items shown according to selected tab
  get displayed(): ConversationListItem[] {
    switch (this.view) {
      case 'unread':   return this.items.filter(i => i.unreadCount > 0 && i.status !== 'ARCHIVED');
      case 'archived': return this.items.filter(i => i.status === 'ARCHIVED');
      default:         return this.items;
    }
  }

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

  onListKeydown(e: KeyboardEvent) {
    if (!this.displayed.length) return;

    if (e.key === 'j' || e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeIndex = Math.min(this.activeIndex + 1, this.displayed.length - 1);
    } else if (e.key === 'k' || e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeIndex = Math.max(this.activeIndex - 1, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const c = this.displayed[this.activeIndex];
      if (c) this.openThread(c);
    }
  }

  imgError(evt: Event) {
    const img = evt.target as HTMLImageElement | null;
    if (!img) return;
    const ds = img.dataset as DOMStringMap;
    if (!ds['fallback']) {
      ds['fallback'] = '1';
      img.src = this.placeholder;
    }
  }

  trackId = (_: number, c: ConversationListItem) => c.id;
}
