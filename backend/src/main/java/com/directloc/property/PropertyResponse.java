package com.directloc.property;

import com.directloc.property.PropertyType;
import com.directloc.property.ViewType;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

/**
 * API DTO returned to clients for a Property.
 * Keep fields nullable so older clients don't break when new fields appear.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PropertyResponse {

    /* ---------- Identity ---------- */
    private UUID id;

    /* ---------- Basic info ---------- */
    private String title;
    private String description;

    /** Region label/slug and city (kept separate for filters). */
    private String region;
    private String city;

    /** Display-friendly location (defaults to "city · region"). */
    private String location;

    /* ---------- Pricing ---------- */
    private BigDecimal pricePerNight;
    private String currency;           // e.g. "EUR"

    /* ---------- Media ---------- */
    private String coverUrl;

    /* ---------- Capacity / size ---------- */
    private Integer maxGuests;
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer beds;
    private Integer areaM2;

    /* ---------- Types ---------- */
    private PropertyType propertyType; // APARTMENT/HOUSE/...
    private ViewType viewType;         // SEA/MOUNTAIN/...

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

    private Integer wifiMbps;
    private Integer minNights;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime checkInFrom;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime checkOutUntil;

    /* ---------- Distances ---------- */
    private BigDecimal distanceToBeachKm;
    private BigDecimal distanceToCenterKm;

    /* ---------- Audit ---------- */
    private Instant createdAt;
    private Instant updatedAt;

    /* ---------- Owner (expose carefully) ---------- */
    private String ownerEmail;
}
