export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface BookingRequest {
  propertyId: string;            // UUID
  checkIn: string;               // 'YYYY-MM-DD'
  checkOut: string;              // 'YYYY-MM-DD'
  adults: number;
  children: number;
  rooms: number;
}

export interface Booking {
  id: number;                    // Long côté back
  propertyId: string;            // UUID
  propertyTitle: string;
  propertyCoverUrl: string | null;
  propertyLocation: string;
  checkIn: string;               // ISO date (YYYY-MM-DD)
  checkOut: string;              // ISO date
  adults: number;
  children: number;
  rooms: number;
  totalPrice: string;            // BigDecimal → string
  status: BookingStatus;
}
