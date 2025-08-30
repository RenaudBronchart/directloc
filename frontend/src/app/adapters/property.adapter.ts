import { PropertyModel, PropertyDetail } from '../models/property.model';
import { PropertyRequestDto, PropertyResponseDto } from '../dto/property.dto';

/** Map backend DTO → UI model */
export function toProperty(dto: PropertyResponseDto): PropertyModel {
  return {
    id: dto.id,
    title: dto.title,
    location: dto.location,
    pricePerNight: dto.pricePerNight,
    coverUrl: dto.coverUrl ?? null,
    bedrooms: dto.bedrooms ?? null,
    bathrooms: dto.bathrooms ?? null,
    maxGuests: dto.maxGuests ?? null,
    description: dto.description,          // optional in UI
    ownerEmail: dto.ownerEmail ?? null,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt ?? null,
  };
}

/** Detail: currently identical, but keep in case detail diverges later */
export function toPropertyDetail(dto: PropertyResponseDto): PropertyDetail {
  return toProperty(dto);
}

/** UI → backend request (here it’s already aligned, pass-through helper) */
export function toPropertyRequestDto(input: PropertyRequestDto): PropertyRequestDto {
  return input;
}
