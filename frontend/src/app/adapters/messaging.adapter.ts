import { ConversationListItem, ChatMessage } from '../models/messaging.model';
import { ConversationSummaryDto, MessageDto } from '../dto/messaging.dto';

const toDate = (iso: string | null | undefined): Date | null =>
  iso ? new Date(iso) : null;

const toNumberOrNull = (v: unknown): number | null =>
  v == null ? null : Number(v);

export const messagingAdapter = {
  toConversationItem(dto: ConversationSummaryDto): ConversationListItem {
    return {
      id: dto.id,
      propertyId: dto.propertyId,
      propertyTitle: dto.propertyTitle,
      otherUserEmail: dto.otherUserEmail,
      preview: dto.lastMessagePreview ?? '',
      lastMessageAt: toDate(dto.lastMessageAt),
      unreadCount: dto.unreadCount ?? 0,
      status: dto.status,
      hasBooking: !!dto.hasBooking,
      propertyCoverUrl: dto.propertyCoverUrl ?? null,

      // ⬇️ nuevos campos ya servidos por el backend
      bookingId: dto.bookingId ?? null,
      checkIn: dto.checkIn ?? null,
      checkOut: dto.checkOut ?? null,
      bookingStatus: dto.bookingStatus ?? null,
      totalPrice: toNumberOrNull(dto.totalPrice),
      currency: dto.currency ?? null,


      pinned: false,
    };
  },

  toMessage(dto: MessageDto): ChatMessage {
    return {
      id: dto.id,
      senderEmail: dto.senderEmail ?? null,
      body: dto.body,
      createdAt: new Date(dto.createdAt),
      mine: !!dto.mine,
    };
  },
};
