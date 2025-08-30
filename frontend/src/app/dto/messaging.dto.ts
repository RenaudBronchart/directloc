export type ConversationStatus = 'OPEN' | 'ARCHIVED' | 'CLOSED';

export interface ConversationSummaryDto {
  id: number;
  propertyId: string;                 // UUID
  propertyTitle: string;
  otherUserEmail: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;       // ISO
  unreadCount: number;
  status: ConversationStatus;
  hasBooking: boolean;                // <-- new
  propertyCoverUrl?: string | null;   // <-- new
}

export interface MessageDto {
  id: number;
  senderEmail: string | null;
  body: string;
  createdAt: string;                  // ISO
  mine: boolean;
}
