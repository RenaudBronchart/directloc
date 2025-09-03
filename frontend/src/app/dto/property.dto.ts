/**
 * Enums alineados con el backend.
 */
export type PropertyType =
  | 'APARTMENT'
  | 'HOUSE'
  | 'VILLA'
  | 'CHALET'
  | 'CABIN'
  | 'STUDIO'
  | 'LOFT'
  | 'FARMHOUSE'
  | 'COTTAGE'
  | 'OTHER';

export type ViewType =
  | 'SEA'
  | 'MOUNTAIN'
  | 'GARDEN'
  | 'CITY'
  | 'RIVER'
  | 'LAKE'
  | 'FOREST'
  | 'NONE';

export interface PropertyResponseDto {
  id: string;                 // UUID
  title: string;
  description: string;
  location: string;

  // Meta
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

  // Check-in/out windows (optional HH:mm)
  checkInFrom?: string | null;
  checkOutUntil?: string | null;

  // Distances (km)
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
  createdAt: string;          // ISO instant
  updatedAt?: string | null;
  ownerEmail?: string | null;
}

/**
 * Payload para create/update (PropertyRequest en el back).
 * `region` y `city` son REQUIRED en el backend.
 * `location` es opcional (el back la deriva si no viene).
 * `currency` es opcional (el back también defaulta a EUR).
 */
export interface PropertyRequestDto {
  title: string;
  description: string;

  region: string;
  city: string;
  location?: string | null;

  pricePerNight: number;
  currency?: string | null;

  // Basics (opcionales)
  bedrooms?: number | null;
  bathrooms?: number | null;
  maxGuests?: number | null;
  beds?: number | null;
  areaM2?: number | null;
  minNights?: number | null;
  coverUrl?: string | null;

  // Check-in/out windows (HH:mm)
  checkInFrom?: string | null;
  checkOutUntil?: string | null;

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
}
