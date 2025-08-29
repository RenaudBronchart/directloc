// DTOs as returned by the backend messaging endpoints

export type ConversationStatus = 'OPEN' | 'ARCHIVED' | 'CLOSED';

export interface ConversationSummaryDto {
  id: number;              // Conversation id (Long)
  propertyId: string;      // UUID
  propertyTitle: string;
  propertyCoverUrl?: string | null; // optional (projection may not include it)
  otherUserEmail: string;
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;     // ISO
  unreadCount: number;
  status?: ConversationStatus;       // optional if projection doesn't include it
}

export interface MessageDto {
  id: number;
  senderEmail: string;
  body: string;
  createdAt: string;       // ISO
  mine: boolean;
}
