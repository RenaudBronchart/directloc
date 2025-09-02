// src/main/java/com/directloc/calendar/CalendarService.java
package com.directloc.calendar;

import com.directloc.booking.Booking;
import com.directloc.booking.BookingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CalendarService {

    private final BookingRepository bookings;

    public CalendarService(BookingRepository bookings) {
        this.bookings = bookings;
    }

    public List<CalendarEventDto> forGuest(String guestEmail, LocalDate from, LocalDate to) {
        return bookings
                .findByGuestEmailAndCheckOutAfterAndCheckInBeforeOrderByCheckInAsc(guestEmail, from, to)
                .stream()
                .map(this::toDto)
                .sorted(Comparator.comparing(CalendarEventDto::getStart))
                .collect(Collectors.toList());
    }

    public List<CalendarEventDto> forHost(String ownerEmail, LocalDate from, LocalDate to) {
        return bookings
                .findByProperty_OwnerEmailAndCheckOutAfterAndCheckInBeforeOrderByCheckInAsc(ownerEmail, from, to)
                .stream()
                .map(this::toDto)
                .sorted(Comparator.comparing(CalendarEventDto::getStart))
                .collect(Collectors.toList());
    }

    public List<CalendarEventDto> forProperty(UUID propertyId, LocalDate from, LocalDate to) {
        return bookings
                .findByProperty_IdAndCheckOutAfterAndCheckInBeforeOrderByCheckInAsc(propertyId, from, to)
                .stream()
                .map(this::toDto)
                .sorted(Comparator.comparing(CalendarEventDto::getStart))
                .collect(Collectors.toList());
    }

    private CalendarEventDto toDto(Booking b) {
        int guests = (b.getAdults() == null ? 0 : b.getAdults())
                + (b.getChildren() == null ? 0 : b.getChildren());
        String status = b.getStatus() != null ? b.getStatus().name() : null;

        Long bookingId = b.getId();                   // Long
        UUID propertyId = b.getProperty().getId();    // UUID
        String title = b.getProperty().getTitle();    // adjust getter name if needed

        return new CalendarEventDto(
                bookingId,
                "BOOKING",
                propertyId,
                title,
                b.getCheckIn(),
                b.getCheckOut(),
                status,
                guests
        );
    }
}
