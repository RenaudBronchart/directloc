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
  hasBooking: boolean;                //
  propertyCoverUrl?: string | null;   //
  bookingId?: number | null;
  checkIn?: string | null;            // yyyy-MM-dd
  checkOut?: string | null;           // yyyy-MM-dd
  bookingStatus?: string | null;      // REQUESTED/ACCEPTED/...
  totalPrice?: number | null;         // BigDecimal en back → number en JSON
  currency?: string | null;
}

export interface MessageDto {
  id: number;
  senderEmail: string | null;
  body: string;
  createdAt: string;                  // ISO
  mine: boolean;
}
