// Converters from DTOs to UI models

import { ConversationSummaryDto, MessageDto } from '../dto/messaging.dto';
import { ConversationListItem, ChatMessage } from '../models/messaging.model';

export const messagingAdapter = {
  toConversationItem(dto: ConversationSummaryDto): ConversationListItem {
    return {
      id: dto.id,
      propertyId: dto.propertyId,
      propertyTitle: dto.propertyTitle,
      propertyCoverUrl: dto.propertyCoverUrl ?? null,
      otherUserEmail: dto.otherUserEmail,
      lastMessagePreview: dto.lastMessagePreview ?? null,
      lastMessageAt: dto.lastMessageAt ? new Date(dto.lastMessageAt) : null,
      unreadCount: dto.unreadCount ?? 0,
      status: dto.status
    };
  },

  toMessage(dto: MessageDto): ChatMessage {
    return {
      id: dto.id,
      senderEmail: dto.senderEmail,
      body: dto.body,
      createdAt: new Date(dto.createdAt),
      mine: dto.mine
    };
  }
};
