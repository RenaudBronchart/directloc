// src/app/services/messaging.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ConversationListItem, ChatMessage } from '../models/messaging.model';
import { ConversationSummaryDto, MessageDto } from '../dto/messaging.dto';
import { messagingAdapter } from '../adapters/messaging.adapter';

export interface PageModel<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
}

/** Base path is built from environment.apiBase. */
const API = `${environment.apiBase}api/messages`;

@Injectable({ providedIn: 'root' })
export class MessagingService {
  constructor(private http: HttpClient) {}

  /** Open/reuse GENERAL conversation for a property. */
  openGeneral(propertyId: string): Observable<ConversationListItem> {
    return this.http
      .post<ConversationSummaryDto>(`${API}/open-general`, { propertyId })
      .pipe(map(messagingAdapter.toConversationItem));
  }

  /** Open/reuse BOOKING conversation for a bookingId. */
  openForBooking(bookingId: number): Observable<ConversationListItem> {
    return this.http
      .post<ConversationSummaryDto>(`${API}/open-booking`, { bookingId })
      .pipe(map(messagingAdapter.toConversationItem));
  }

  /** Backward-compat wrapper (property chat). */
  open(propertyId: string): Observable<ConversationListItem> {
    return this.openGeneral(propertyId);
  }

  /** Inbox list for current user. Always returns an array on the client. */
  conversations(page = 0, size = 30): Observable<ConversationListItem[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<ConversationSummaryDto[] | PageModel<ConversationSummaryDto>>(
        `${API}/conversations`,
        { params }
      )
      .pipe(
        map(res => {
          const list = Array.isArray(res) ? res : res?.content;
          return (list ?? []).map(messagingAdapter.toConversationItem);
        })
      );
  }

  /** Messages in a thread. Always returns an array on the client. */
  thread(id: number, page = 0, size = 200): Observable<ChatMessage[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<MessageDto[] | PageModel<MessageDto>>(`${API}/${id}/messages`, { params })
      .pipe(
        map(res => {
          const list = Array.isArray(res) ? res : res?.content;
          return (list ?? []).map(messagingAdapter.toMessage);
        })
      );
  }

  /** Send a message. */
  send(id: number, body: string): Observable<ChatMessage> {
    return this.http
      .post<MessageDto>(`${API}/${id}`, { body })
      .pipe(map(messagingAdapter.toMessage));
  }

  /** Mark read / archive / unarchive. */
  markRead(id: number): Observable<void> { return this.http.patch<void>(`${API}/${id}/read`, {}); }
  archive(id: number): Observable<void> { return this.http.patch<void>(`${API}/${id}/archive`, {}); }
  unarchive(id: number): Observable<void> { return this.http.patch<void>(`${API}/${id}/unarchive`, {}); }

  /** Unread counter for the topbar badge. */
  unreadCount(): Observable<number> {
    return this.http.get<number>(`${API}/unread-count`);
  }
}
