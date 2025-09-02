// src/main/java/com/directloc/property/search/PropertySearchCriteria.java
package com.directloc.property.search;

import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Incoming search filters. Add new fields here without touching the entity.
 * Use this both for GET query params and POST /search JSON bodies.
 */
@Getter @Setter
public class PropertySearchCriteria {

    /** Free text (title/description/location). */
    private String q;

    /** Region slug (e.g. "brittany", "loire-valley"). We'll match against location for now. */
    private String region;

    /** Price filters. */
    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    /** Minimum counts. */
    private Integer bedroomsMin;
    private Integer bathroomsMin;
    private Integer guestsMin; // adults + children total

    /** Availability window: exclude properties with ACCEPTED overlap. */
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate checkIn;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate checkOut;

    /** Optional amenities (add later when you persist features). */
    private Boolean pool;
    private Boolean parking;
    private Boolean petsAllowed;
    private Integer wifiMin;

    /** Optional sort selector (fallback to Pageable sort if provided). */
    private SortBy sortBy;

    public enum SortBy {
        NEWEST, PRICE_ASC, PRICE_DESC, GUESTS_DESC
    }
}
