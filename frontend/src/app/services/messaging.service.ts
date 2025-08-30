import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
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

@Injectable({ providedIn: 'root' })
export class MessagingService {
  private readonly API = 'http://localhost:8080/api/messages';

  constructor(private http: HttpClient) {}

  /** Back compat: alias que llama al general */
  open(propertyId: string): Observable<ConversationListItem> {
    return this.openGeneral(propertyId);
  }

  /** Abrir/reutilizar hilo GENERAL (sin booking) */
  openGeneral(propertyId: string): Observable<ConversationListItem> {
    return this.http
      .post<ConversationSummaryDto>(`${this.API}/open-general`, { propertyId })
      .pipe(map(messagingAdapter.toConversationItem));
  }

  /** Abrir/reutilizar hilo por RESERVA */
  openForBooking(bookingId: number): Observable<ConversationListItem> {
    return this.http
      .post<ConversationSummaryDto>(`${this.API}/open-booking`, { bookingId })
      .pipe(map(messagingAdapter.toConversationItem));
  }

  /** Lista de conversaciones (devuelve array en el front) */
  conversations(page = 0, size = 30): Observable<ConversationListItem[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<ConversationSummaryDto[] | PageModel<ConversationSummaryDto>>(
        `${this.API}/conversations`,
        { params }
      )
      .pipe(
        map(res => {
          const list = Array.isArray(res) ? res : res?.content;
          return (list ?? []).map(messagingAdapter.toConversationItem);
        })
      );
  }

  /** Mensajes del hilo (array en el front) */
  thread(id: number, page = 0, size = 200): Observable<ChatMessage[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<MessageDto[] | PageModel<MessageDto>>(`${this.API}/${id}/messages`, { params })
      .pipe(
        map(res => {
          const list = Array.isArray(res) ? res : res?.content;
          return (list ?? []).map(messagingAdapter.toMessage);
        })
      );
  }

  /** Enviar */
  send(id: number, body: string): Observable<ChatMessage> {
    return this.http
      .post<MessageDto>(`${this.API}/${id}`, { body })
      .pipe(map(messagingAdapter.toMessage));
  }

  unreadCount() {
    return this.http.get<number>(`${this.API}/unread-count`);
  }

  /** Marcar leído / archivar / desarchivar */
  markRead(id: number): Observable<void> { return this.http.patch<void>(`${this.API}/${id}/read`, {}); }
  archive(id: number): Observable<void> { return this.http.patch<void>(`${this.API}/${id}/archive`, {}); }
  unarchive(id: number): Observable<void> { return this.http.patch<void>(`${this.API}/${id}/unarchive`, {}); }
}
