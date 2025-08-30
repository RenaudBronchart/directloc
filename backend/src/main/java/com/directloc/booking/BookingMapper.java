// src/main/java/com/directloc/booking/BookingMapper.java
package com.directloc.booking;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Simple mapping utilities between Booking (entity) and BookingResponse (DTO).
 * This class is intentionally stateless and exposes only static helpers.
 *
 * ⚠️ Note: Property is a LAZY association in Booking. Make sure repository
 * methods that feed this mapper fetch what you need (via fetch-join) or are
 * called within an open persistence context to avoid LazyInitializationException.
 */
public final class BookingMapper {

    private BookingMapper() { /* no instances */ }

    /**
     * Maps a single Booking entity to its DTO.
     * - Adults/children/rooms are defaulted to 0/0/1 when null to keep the API stable.
     * - Property fields are read defensively (null-safe), although property is required.
     */
    public static BookingResponse toDto(Booking b) {
        if (b == null) return null;

        var p = b.getProperty(); // local var to avoid repeated getters

        return new BookingResponse(
                b.getId(),
                p != null ? p.getId() : null,           // UUID
                p != null ? p.getTitle() : null,
                p != null ? p.getCoverUrl() : null,
                p != null ? p.getLocation() : null,
                b.getCheckIn(),
                b.getCheckOut(),
                defaultInt(b.getAdults(), 0),
                defaultInt(b.getChildren(), 0),
                defaultInt(b.getRooms(), 1),
                b.getTotalPrice(),
                b.getStatus()
        );
    }

    /** Convenience method to map lists without repeating stream boilerplate. */
    public static List<BookingResponse> toDtoList(List<Booking> list) {
        if (list == null) return List.of();
        return list.stream()
                .filter(Objects::nonNull)
                .map(BookingMapper::toDto)
                .collect(Collectors.toList());
    }

    /* ---------- internal helpers ---------- */

    private static int defaultInt(Integer value, int fallback) {
        return value == null ? fallback : value;
    }
}
