// Wire-level DTOs that mirror the backend payloads.

export type BookingStatusDto = 'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';

export interface BookingResponseDto {
  id: number;
  propertyId: string;          // UUID
  propertyTitle: string;
  propertyCoverUrl: string | null;
  propertyLocation: string;
  checkIn: string;             // 'YYYY-MM-DD'
  checkOut: string;            // 'YYYY-MM-DD'
  adults: number;
  children: number;
  rooms: number;
  totalPrice: number | string; // BigDecimal sometimes arrives as string
  status: BookingStatusDto;
}

export interface BookingRequestDto {
  propertyId: string;
  checkIn: string;             // 'YYYY-MM-DD'
  checkOut: string;            // 'YYYY-MM-DD'
  adults: number;
  children: number;
  rooms: number;
}

export interface BookedDaysDto {
  days: string[];
}
