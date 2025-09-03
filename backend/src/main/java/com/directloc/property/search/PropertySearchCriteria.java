// src/main/java/com/directloc/property/search/PropertySearchCriteria.java
package com.directloc.property.search;

import com.directloc.property.PropertyType;
import com.directloc.property.ViewType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Incoming search filters. Used for GET query params and POST /search JSON bodies.
 * All fields are optional; add fields here without touching the entity.
 */
@Getter @Setter
public class PropertySearchCriteria {

    /** Free text (title/description/location). */
    private String q;

    /** Region slug (e.g. "brittany", "loire-valley"). We'll match against location for now. */
    private String region;

    /* ---------- Price ---------- */
    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    /* ---------- Minimum counts ---------- */
    private Integer bedroomsMin;
    private Integer bathroomsMin;
    private Integer bedsMin;       // NEW
    private Integer guestsMin;     // adults + children total

    /* ---------- Surface / nights ---------- */
    private Integer areaM2Min;     // NEW
    private Integer minNightsMin;  // NEW

    /* ---------- Distances (km) ---------- */
    private Double maxDistCenterKm; // NEW (≤ distanceToCenterKm)
    private Double maxDistBeachKm;  // NEW (≤ distanceToBeachKm)

    /* ---------- Connectivity ---------- */
    private Integer wifiMin; // compare against wifiMbps

    /* ---------- Types ---------- */
    private PropertyType propertyType; // NEW
    private ViewType viewType;         // NEW

    /* ---------- Amenities (booleans) ---------- */
    private Boolean pool;            // now applied
    private Boolean parking;         // now applied
    private Boolean petFriendly;     // NEW (rename from petsAllowed)
    private Boolean smokingAllowed;  // NEW
    private Boolean garden;          // NEW
    private Boolean terrace;         // NEW
    private Boolean balcony;         // NEW
    private Boolean hotTub;          // NEW
    private Boolean airConditioning; // NEW
    private Boolean heating;         // NEW
    private Boolean accessible;      // NEW
    private Boolean workspace;       // NEW

    /* ---------- Availability window ---------- */
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate checkIn;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate checkOut;

    /* ---------- Sort selector ---------- */
    private SortBy sortBy;

    public enum SortBy {
        NEWEST, PRICE_ASC, PRICE_DESC, GUESTS_DESC
    }
}
