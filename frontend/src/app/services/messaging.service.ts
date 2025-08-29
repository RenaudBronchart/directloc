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
  number?: number;     // page index
  size?: number;       // page size
}

@Injectable({ providedIn: 'root' })
export class MessagingService {
  private readonly API = 'http://localhost:8080/api/messages';

  constructor(private http: HttpClient) {}

  /** Abre (o reutiliza) una conversación para una propiedad */
  open(propertyId: string): Observable<ConversationListItem> {
    return this.http
      .post<ConversationSummaryDto>(`${this.API}/open`, { propertyId })
      .pipe(map(messagingAdapter.toConversationItem));
  }

  /** Lista de conversaciones del usuario (devuelve SIEMPRE array en el front) */
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

  /** Mensajes del hilo (devuelve SIEMPRE array en el front) */
  thread(id: number, page = 0, size = 100): Observable<ChatMessage[]> {
    const params = new HttpParams().set('page', page).set('size', size);

    return this.http
      .get<MessageDto[] | PageModel<MessageDto>>(
        `${this.API}/${id}/messages`,
        { params }
      )
      .pipe(
        map(res => {
          const list = Array.isArray(res) ? res : res?.content;
          return (list ?? []).map(messagingAdapter.toMessage);
        })
      );
  }

  /** Enviar mensaje */
  send(id: number, body: string): Observable<ChatMessage> {
    return this.http
      .post<MessageDto>(`${this.API}/${id}`, { body })
      .pipe(map(messagingAdapter.toMessage));
  }

  /** Marcar leído / archivar / desarchivar */
  markRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.API}/${id}/read`, {});
  }
  archive(id: number): Observable<void> {
    return this.http.patch<void>(`${this.API}/${id}/archive`, {});
  }
  unarchive(id: number): Observable<void> {
    return this.http.patch<void>(`${this.API}/${id}/unarchive`, {});
  }
}
