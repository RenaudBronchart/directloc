package com.directloc.property;

import com.directloc.property.PropertyType;
import com.directloc.property.ViewType;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalTime;

/**
 * Request DTO to create/update a Property.
 * Keep this class flat and tolerant: most fields are optional so the server
 * can derive sensible defaults (e.g. currency/location) and evolve over time.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class PropertyRequest {

    /* ---------- Basic info ---------- */

    @NotBlank
    @Size(max = 255, message = "Title must be at most 255 characters.")
    private String title;

    @NotBlank
    @Size(max = 2000, message = "Description must be at most 2000 characters.")
    private String description;

    /** Region label or slug (e.g., "Gironde · France"). */
    @NotBlank
    @Size(max = 120)
    private String region;

    /** City name (e.g., "Bordeaux"). */
    @NotBlank
    @Size(max = 120)
    private String city;

    /**
     * Legacy free-form location; optional.
     * If null/blank, the entity will derive it from "city · region".
     */
    @Size(max = 255, message = "Location must be at most 255 characters.")
    private String location;

    /* ---------- Pricing ---------- */

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be > 0.")
    private BigDecimal pricePerNight;

    /** ISO-4217 currency code; optional (defaults to EUR). */
    @Size(max = 3)
    private String currency;

    /* ---------- Capacities ---------- */

    @Min(1)
    private Integer maxGuests;

    @Min(0)
    private Integer bedrooms;

    @Min(0)
    private Integer bathrooms;

    @Min(0)
    private Integer beds;

    /** Area in square meters. */
    @Min(0)
    private Integer areaM2;

    /* ---------- Types ---------- */

    private String propertyType;  // APARTMENT/HOUSE/...
    private String viewType;          // SEA/MOUNTAIN/...

    /* ---------- Amenities / rules ---------- */

    private Boolean parking;
    private Boolean workspace;
    private Boolean pool;
    private Boolean terrace;

    private Boolean petFriendly;
    private Boolean airConditioning;
    private Boolean hotTub;
    private Boolean balcony;

    private Boolean smokingAllowed;
    private Boolean heating;
    private Boolean garden;
    private Boolean accessible;

    /** Wi-Fi speed in Mbps. */
    @Min(0)
    private Integer wifiMbps;

    /** Minimum nights required for a booking. */
    @Min(0)
    private Integer minNights;

    /** Check-in / check-out time hints (HH:mm). */
    @JsonFormat(pattern = "HH:mm")
    private LocalTime checkInFrom;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime checkOutUntil;

    /* ---------- Distances ---------- */

    @DecimalMin(value = "0.0")
    private BigDecimal distanceToBeachKm;

    @DecimalMin(value = "0.0")
    private BigDecimal distanceToCenterKm;

    /* ---------- Media ---------- */

    /** Optional cover image; entity will auto-generate if blank. */
    private String coverUrl;
}
