import { PropertyModel, PropertyDetail } from '../models/property.model';
import { PropertyRequestDto, PropertyResponseDto,PropertyType, ViewType  } from '../dto/property.dto';
/** Map backend DTO → UI model */
export function toProperty(dto: PropertyResponseDto): PropertyModel {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    location: dto.location,

    // Meta
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

/** UI → backend request (normalize & ensure correct names) */
export function toPropertyRequestDto(input: PropertyRequestDto): PropertyRequestDto {
  // Acepta sinónimos por seguridad
  const anyIn = input as any;

  // Normaliza enums a MAYÚSCULAS si vienen en minúsculas/título
  const normEnum = (s?: string | null) =>
    s ? String(s).trim().toUpperCase() : null;

  // Soporta areaSqm → areaM2
  const areaM2 = input.areaM2 ?? anyIn.areaSqm ?? null;

  // Soporta beachKm/centerKm → distanceToBeachKm/distanceToCenterKm
  const distanceToBeachKm = input.distanceToBeachKm ?? anyIn.beachKm ?? null;
  const distanceToCenterKm = input.distanceToCenterKm ?? anyIn.centerKm ?? null;

  // dedicatedWorkspace → workspace
  const workspace = input.workspace ?? !!anyIn.dedicatedWorkspace;

  // petsAllowed → petFriendly (nombre correcto del backend)
  const petFriendly = input.petFriendly ?? !!anyIn.petsAllowed;

  // view → viewType
  const viewType = normEnum(input.viewType ?? anyIn.view);

  const payload: PropertyRequestDto = {
    // obligatorios en back
    title: (input.title ?? '').trim(),
    description: (input.description ?? '').trim(),
    region: (input.region ?? '').trim(),
    city: (input.city ?? '').trim(),

    // opcional (el back la deriva si no se manda)
    location: (input.location ?? null) ? (input.location as string).trim() : null,

    pricePerNight: input.pricePerNight,
    currency: input.currency ?? null,

    // basics
    bedrooms: input.bedrooms ?? null,
    bathrooms: input.bathrooms ?? null,
    maxGuests: input.maxGuests ?? null,
    beds: input.beds ?? null,
    areaM2,
    minNights: input.minNights ?? null,
    coverUrl: input.coverUrl ?? null,

    // types
    propertyType: (normEnum(input.propertyType) as PropertyType | null),
    viewType: (viewType as ViewType | null),

    // amenities/rules
    pool: !!input.pool,
    parking: !!input.parking,
    petFriendly,
    smokingAllowed: !!input.smokingAllowed,
    garden: !!input.garden,
    terrace: !!input.terrace,
    balcony: !!input.balcony,
    hotTub: !!input.hotTub,
    airConditioning: !!input.airConditioning,
    heating: !!input.heating,
    accessible: !!input.accessible,
    workspace,

    // otros cuantificables
    wifiMbps: input.wifiMbps ?? null,
    checkInFrom: input.checkInFrom ?? null,
    checkOutUntil: input.checkOutUntil ?? null,
    distanceToBeachKm,
    distanceToCenterKm,
  };

  return payload;
}
