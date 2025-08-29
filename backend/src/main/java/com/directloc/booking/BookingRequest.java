// src/main/java/com/directloc/booking/BookingRequest.java
package com.directloc.booking;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Incoming payload for creating a booking.
 * Notes:
 * - We keep fields as primitives (int) so they can’t be null at JSON binding time.
 * - Cross-field rules (e.g., checkOut after checkIn, min 2 nights) are enforced in the service.
 *   You can also move them here with @AssertTrue methods if you prefer bean validation errors.
 */
public record BookingRequest(
        @NotNull UUID propertyId,     // Target property UUID
        @NotNull LocalDate checkIn,   // Expected format: ISO-8601 (yyyy-MM-dd)
        @NotNull LocalDate checkOut,  // Expected format: ISO-8601 (yyyy-MM-dd)
        @Min(1) int adults,           // At least one adult
        @Min(0) int children,         // Children can be zero
        @Min(1) int rooms             // At least one room
) {}
