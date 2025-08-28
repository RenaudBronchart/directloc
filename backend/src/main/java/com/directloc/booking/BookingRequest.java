package com.directloc.booking;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.UUID;

public record BookingRequest(
        @NotNull UUID propertyId,
        @NotNull LocalDate checkIn,
        @NotNull LocalDate checkOut,
        @Min(1) int adults,
        @Min(0) int children,
        @Min(1) int rooms
) {}
