// Converts between DTOs (wire) and UI models.

import { BookingResponseDto, BookingRequestDto } from '../dto/booking.dto';
import { BookingModel, BookingRequest } from '../models/booking.model';

export function toBooking(dto: BookingResponseDto): BookingModel {
  return {
    id: dto.id,
    propertyId: dto.propertyId,
    propertyTitle: dto.propertyTitle,
    propertyCoverUrl: dto.propertyCoverUrl,
    propertyLocation: dto.propertyLocation,
    checkIn: dto.checkIn,
    checkOut: dto.checkOut,
    adults: dto.adults,
    children: dto.children,
    rooms: dto.rooms,
    totalPrice: typeof dto.totalPrice === 'string' ? parseFloat(dto.totalPrice) : dto.totalPrice,
    status: dto.status,
  };
}

export function toBookings(dtos: BookingResponseDto[]): BookingModel[] {
  return dtos.map(toBooking);
}

export function requestToDto(req: BookingRequest): BookingRequestDto {
  // Same shape today, but keeping the adapter future-proofs us
  return { ...req };
}
