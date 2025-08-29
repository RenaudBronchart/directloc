// UI models for chat components

export interface ConversationListItem {
  id: number;
  propertyId: string;
  propertyTitle: string;
  propertyCoverUrl?: string | null;
  otherUserEmail: string;
  lastMessagePreview?: string | null;
  lastMessageAt?: Date | null;
  unreadCount: number;
  status?: 'OPEN' | 'ARCHIVED' | 'CLOSED';
}

export interface ChatMessage {
  id: number;
  senderEmail: string;
  body: string;
  createdAt: Date;
  mine: boolean;
}

export type ConversationSummary = ConversationListItem;
