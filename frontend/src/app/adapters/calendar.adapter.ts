import { CalendarEventDto } from '../dto/calendar.dto';
import { CalendarEventModel } from '../models/calendar.model';

export function toCalendarEvent(dto: CalendarEventDto): CalendarEventModel {
  const start = new Date(dto.startDate);
  const end   = new Date(dto.endDate);

  return {
    kind: dto.kind,
    bookingId: dto.bookingId ?? null,
    blockId: dto.blockId ?? null,
    propertyId: dto.propertyId,
    propertyTitle: dto.propertyTitle ?? '—',
    title: (dto.title ?? '').trim() || (dto.kind === 'BLOCK' ? 'Blocked' : 'Booking'),
    status: dto.status ?? null,
    start, end,
    isBooking: dto.kind === 'BOOKING',
    isBlock: dto.kind === 'BLOCK',
  };
}
