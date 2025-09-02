export type CalendarEventKind = 'BOOKING' | 'BLOCK';
export type CalendarRole = 'HOST' | 'GUEST';

export interface CalendarEventDto {
  kind: CalendarEventKind;
  role: CalendarRole;               // HOST o GUEST (útil por si el back lo añade)
  // Identificadores
  bookingId?: number | null;        // solo para BOOKING
  blockId?: number | null;          // solo para BLOCK
  propertyId: string;               // UUID
  // Datos
  propertyTitle?: string | null;
  title?: string | null;            // ej: "Booking #123" o motivo del bloqueo
  status?: string | null;           // ej: REQUESTED/ACCEPTED... para bookings
  startDate: string;                // yyyy-MM-dd (inclusive)
  endDate: string;                  // yyyy-MM-dd (exclusive o inclusive según back; solo mostramos)
}

export interface PropertyBlockCreateDto {
  propertyId: string;   // UUID/Id de la propiedad (string en el front)
  from: string;         // 'yyyy-MM-dd'
  to: string;           // 'yyyy-MM-dd'
  reason?: string;
}

