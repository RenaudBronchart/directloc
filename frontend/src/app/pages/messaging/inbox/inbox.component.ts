import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MessagingService } from '../../../services/messaging.service';
import { ConversationListItem } from '../../../models/messaging.model';
import { Observable } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-inbox',
  imports: [CommonModule, RouterModule, MatIconModule, DatePipe],
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent {
  private svc = inject(MessagingService);
  items$: Observable<ConversationListItem[]> = this.svc.conversations();
}
