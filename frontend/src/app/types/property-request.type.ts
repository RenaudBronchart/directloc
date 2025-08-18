// src/app/types/property-request.type.ts
export interface PropertyRequest {
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  maxGuests?: number | null;
  coverUrl?: string | null;
}
