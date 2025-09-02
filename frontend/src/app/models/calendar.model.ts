

import { CalendarEventKind } from '../dto/calendar.dto';

export interface CalendarEventModel {
  kind: CalendarEventKind;
  // IDs
  bookingId?: number | null;
  blockId?: number | null;
  propertyId: string;               // UUID

  // Datos
  propertyTitle: string;
  title: string;
  status?: string | null;

  start: Date;
  end: Date;

  // helpers
  isBooking: boolean;
  isBlock: boolean;
}
