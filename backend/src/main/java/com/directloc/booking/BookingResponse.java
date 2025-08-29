// src/main/java/com/directloc/booking/BookingResponse.java
package com.directloc.booking;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Outgoing DTO returned by the booking API.
 * - Contains denormalized property info for convenient rendering on the frontend.
 * - Dates are LocalDate (ISO-8601 by default with Jackson).
 * - totalPrice uses BigDecimal to preserve precision (it will serialize as a JSON number).
 *
 * If you want totalPrice as a STRING (to fully control formatting or avoid scientific notation),
 * either:
 *   1) Change this field to String and map totalPrice.toPlainString() in BookingMapper, OR
 *   2) Keep BigDecimal here and configure Jackson:
 *        spring.jackson.generator.write-bigdecimal-as-plain=true
 *      (so large decimals don’t use exponent notation).
 */
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
        BigDecimal totalPrice,   // JSON number by default
        BookingStatus status     // e.g. REQUESTED, ACCEPTED, DECLINED, CANCELLED
) {}
