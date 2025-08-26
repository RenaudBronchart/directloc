package com.directloc.booking;

import com.directloc.booking.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record BookingResponse(
        Long id,
        UUID propertyId,
        String propertyTitle,
        String propertyCoverUrl,
        String propertyLocation,
        LocalDate checkIn,
        LocalDate checkOut,
        int adults,
        int children,
        int rooms,
        BigDecimal totalPrice,
        BookingStatus status
) {}
