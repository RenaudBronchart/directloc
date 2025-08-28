package com.directloc.booking;

import com.directloc.booking.BookingResponse;

public class BookingMapper {
    public static BookingResponse toDto(Booking b) {
        return new BookingResponse(
                b.getId(),
                b.getProperty().getId(),        // UUID
                b.getProperty().getTitle(),
                b.getProperty().getCoverUrl(),
                b.getProperty().getLocation(),
                b.getCheckIn(),
                b.getCheckOut(),
                b.getAdults() == null ? 0 : b.getAdults(),
                b.getChildren() == null ? 0 : b.getChildren(),
                b.getRooms() == null ? 1 : b.getRooms(),
                b.getTotalPrice(),
                b.getStatus()
        );
    }
}