/**
 * Keep this 1:1 with the backend PropertyResponse.
 * String unions here should match your Java enums.
 */
export type PropertyType =
  | 'APARTMENT'
  | 'HOUSE'
  | 'VILLA'
  | 'COTTAGE'
  | 'B&B'
  | 'CHALET'
  | 'TOWNHOUSE'
  | 'STUDIO'
  | 'OTHER';

export type ViewType =
  | 'SEA'
  | 'MOUNTAIN'
  | 'CITY'
  | 'GARDEN'
  | 'RIVER'
  | 'COURTYARD'
  | 'NONE';

export interface PropertyResponseDto {
  id: string;                 // UUID
  title: string;
  description: string;
  location: string;

  // NEW meta
  city?: string | null;
  region?: string | null;
  currency: string;           // e.g. "EUR"

  // Pricing
  pricePerNight: number;      // BigDecimal serialized as number

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
 * Payload for create/update (PropertyRequest).
 * Required vs optional mirrors backend validation.
 */
export interface PropertyRequestDto {
  title: string;
  description: string;
  location: string;

  // NEW: currency required by backend; service will auto-fill default if missing
  currency: string;

  pricePerNight: number;

  // Basics (optional)
  bedrooms?: number | null;
  bathrooms?: number | null;
  maxGuests?: number | null;
  beds?: number | null;
  areaM2?: number | null;
  minNights?: number | null;
  coverUrl?: string | null;

  // Meta (optional)
  city?: string | null;
  region?: string | null;

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
