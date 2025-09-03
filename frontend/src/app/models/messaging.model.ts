export type ConversationStatus = 'OPEN' | 'ARCHIVED' | 'CLOSED';

export interface ConversationListItem {
  id: number;
  propertyId: string;                 // UUID
  propertyTitle: string;
  otherUserEmail: string;
  preview: string;
  lastMessageAt: Date | null;
  unreadCount: number;
  status: ConversationStatus;
  hasBooking: boolean;
  propertyCoverUrl?: string | null;

  bookingId?: number | null;
  checkIn?: string | null;        // yyyy-MM-dd
  checkOut?: string | null;       // yyyy-MM-dd
  bookingStatus?: string | null;  // REQUESTED/ACCEPTED/...
  totalPrice?: number | null;
  currency?: string | null;

  // (si usas pin en UI)
  pinned?: boolean;
}

export interface ChatMessage {
  id: number;
  senderEmail: string | null;
  body: string;
  createdAt: Date;
  mine: boolean;
}
