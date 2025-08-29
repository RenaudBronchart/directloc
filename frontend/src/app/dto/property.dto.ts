/**
 * Raw response as returned by the backend (PropertyResponse).
 * Keep this 1:1 with the backend contract.
 */
export interface PropertyResponseDto {
  id: string;                 // UUID
  title: string;
  description: string;
  location: string;
  pricePerNight: number;      // BigDecimal serialized as number in JSON
  coverUrl?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  maxGuests?: number | null;
  createdAt: string;          // ISO instant
  updatedAt?: string | null;  // can be null/absent on first insert
  ownerEmail?: string | null;
}

/**
 * Payload used to create/update a property (PropertyRequest).
 * Mirrors backend validation: required vs optional.
 */
export interface PropertyRequestDto {
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  maxGuests?: number | null;
  coverUrl?: string | null;
}
