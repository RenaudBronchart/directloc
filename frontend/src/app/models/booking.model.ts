// UI-friendly booking model consumed by components.

export type BookingStatus = 'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';

export interface BookingModel {
  id: number;                 // Long (backend)
  propertyId: string;         // UUID
  propertyTitle: string;
  propertyCoverUrl: string | null;
  propertyLocation: string;
  checkIn: string;            // 'YYYY-MM-DD'
  checkOut: string;           // 'YYYY-MM-DD'
  adults: number;
  children: number;
  rooms: number;
  totalPrice: number;         // normalized to number
  status: BookingStatus;
}

// UI request model built by the component
export interface BookingRequest {
  propertyId: string;
  checkIn: string;            // 'YYYY-MM-DD'
  checkOut: string;           // 'YYYY-MM-DD'
  adults: number;
  children: number;
  rooms: number;
}
