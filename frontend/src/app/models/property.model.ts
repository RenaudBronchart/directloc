import type { PropertyType, ViewType } from '../dto/property.dto';

export interface PropertyModel {
  id: string;
  title: string;
  description?: string;
  location: string;

  // NEW meta
  city?: string | null;
  region?: string | null;
  currency: string;           // e.g. "EUR"

  // Pricing
  pricePerNight: number;

  // Basics
  coverUrl?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  maxGuests?: number | null;
  beds?: number | null;
  areaM2?: number | null;
  minNights?: number | null;

  // Check-in/out windows
  checkInFrom?: string | null;     // "HH:mm"
  checkOutUntil?: string | null;   // "HH:mm"

  // Distances
  distanceToCenterKm?: number | null;
  distanceToBeachKm?: number | null;

  // Types
  propertyType?: PropertyType | null;
  viewType?: ViewType | null;

  // Amenities
  pool?: boolean;
  parking?: boolean;
  petFriendly?: boolean;
  smokingAllowed?: boolean;
  garden?: boolean;
  terrace?: boolean;
  balcony?: boolean;
  hotTub?: boolean;
  airConditioning?: boolean;
  heating?: boolean;
  accessible?: boolean;
  workspace?: boolean;
  wifiMbps?: number | null;

  // Audit/owner
  ownerEmail?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PropertyDetail extends PropertyModel {}
