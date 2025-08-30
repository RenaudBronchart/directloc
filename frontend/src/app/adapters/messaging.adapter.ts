import { ConversationListItem, ChatMessage } from '../models/messaging.model';
import { ConversationSummaryDto, MessageDto } from '../dto/messaging.dto';

const toDate = (iso: string | null | undefined): Date | null =>
  iso ? new Date(iso) : null;

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
