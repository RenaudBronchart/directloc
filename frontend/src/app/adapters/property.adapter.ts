import { PropertyModel, PropertyDetail } from '../models/property.model';
import { PropertyRequestDto, PropertyResponseDto } from '../dto/property.dto';

/** Map backend DTO → UI model */
export function toProperty(dto: PropertyResponseDto): PropertyModel {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    location: dto.location,

    // NEW meta
    city: dto.city ?? null,
    region: dto.region ?? null,
    currency: dto.currency ?? 'EUR',

    // Pricing
    pricePerNight: dto.pricePerNight,

    // Basics
    coverUrl: dto.coverUrl ?? null,
    bedrooms: dto.bedrooms ?? null,
    bathrooms: dto.bathrooms ?? null,
    maxGuests: dto.maxGuests ?? null,
    beds: dto.beds ?? null,
    areaM2: dto.areaM2 ?? null,
    minNights: dto.minNights ?? null,

    // Check-in/out windows (optional)
    checkInFrom: dto.checkInFrom ?? null,
    checkOutUntil: dto.checkOutUntil ?? null,

    // Distances
    distanceToCenterKm: dto.distanceToCenterKm ?? null,
    distanceToBeachKm: dto.distanceToBeachKm ?? null,

    // Types
    propertyType: dto.propertyType ?? null,
    viewType: dto.viewType ?? null,

    // Amenities
    pool: dto.pool ?? false,
    parking: dto.parking ?? false,
    petFriendly: dto.petFriendly ?? false,
    smokingAllowed: dto.smokingAllowed ?? false,
    garden: dto.garden ?? false,
    terrace: dto.terrace ?? false,
    balcony: dto.balcony ?? false,
    hotTub: dto.hotTub ?? false,
    airConditioning: dto.airConditioning ?? false,
    heating: dto.heating ?? false,
    accessible: dto.accessible ?? false,
    workspace: dto.workspace ?? false,
    wifiMbps: dto.wifiMbps ?? null,

    // Audit/owner
    ownerEmail: dto.ownerEmail ?? null,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt ?? null,
  };
}

/** Detail mapping (kept separate in case detail diverges later) */
export function toPropertyDetail(dto: PropertyResponseDto): PropertyDetail {
  return toProperty(dto);
}

/** UI → backend request (pass-through but ensures defined optional fields) */
export function toPropertyRequestDto(input: PropertyRequestDto): PropertyRequestDto {
  // In case the form doesn’t provide some optional fields, normalize here
  return {
    ...input,
    coverUrl: input.coverUrl ?? null,
    city: input.city ?? null,
    region: input.region ?? null,
    beds: input.beds ?? null,
    areaM2: input.areaM2 ?? null,
    minNights: input.minNights ?? null,
    checkInFrom: input.checkInFrom ?? null,
    checkOutUntil: input.checkOutUntil ?? null,
    distanceToCenterKm: input.distanceToCenterKm ?? null,
    distanceToBeachKm: input.distanceToBeachKm ?? null,
    propertyType: input.propertyType ?? null,
    viewType: input.viewType ?? null,
    wifiMbps: input.wifiMbps ?? null,

    // booleans default false if omitted
    pool: !!input.pool,
    parking: !!input.parking,
    petFriendly: !!input.petFriendly,
    smokingAllowed: !!input.smokingAllowed,
    garden: !!input.garden,
    terrace: !!input.terrace,
    balcony: !!input.balcony,
    hotTub: !!input.hotTub,
    airConditioning: !!input.airConditioning,
    heating: !!input.heating,
    accessible: !!input.accessible,
    workspace: !!input.workspace,
  };
}
