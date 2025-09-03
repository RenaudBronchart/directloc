// src/main/java/com/directloc/property/search/PropertySpecifications.java
package com.directloc.property.search;

import com.directloc.booking.Booking;
import com.directloc.booking.BookingStatus;
import com.directloc.property.Property;
import com.directloc.property.PropertyType;
import com.directloc.property.ViewType;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.Locale;

/**
 * All search predicates live here. Compose them safely.
 */
public final class PropertySpecifications {

    private PropertySpecifications() {}

    public static Specification<Property> byCriteria(PropertySearchCriteria c) {
        return Specification
                .where(textSearch(c.getQ()))
                .and(regionContains(c.getRegion()))
                // price
                .and(minPrice(c.getMinPrice()))
                .and(maxPrice(c.getMaxPrice()))
                // counts
                .and(bedroomsMin(c.getBedroomsMin()))
                .and(bathroomsMin(c.getBathroomsMin()))
                .and(bedsMin(c.getBedsMin()))
                .and(guestsMin(c.getGuestsMin()))
                // surface & stay
                .and(areaM2Min(c.getAreaM2Min()))
                .and(minNightsMin(c.getMinNightsMin()))
                // distances
                .and(maxDistCenterKm(c.getMaxDistCenterKm()))
                .and(maxDistBeachKm(c.getMaxDistBeachKm()))
                // connectivity
                .and(wifiMin(c.getWifiMin()))
                // types
                .and(propertyType(c.getPropertyType()))
                .and(viewType(c.getViewType()))
                // amenities (true-only)
                .and(pool(c.getPool()))
                .and(parking(c.getParking()))
                .and(petFriendly(c.getPetFriendly()))
                .and(smokingAllowed(c.getSmokingAllowed()))
                .and(garden(c.getGarden()))
                .and(terrace(c.getTerrace()))
                .and(balcony(c.getBalcony()))
                .and(hotTub(c.getHotTub()))
                .and(airConditioning(c.getAirConditioning()))
                .and(heating(c.getHeating()))
                .and(accessible(c.getAccessible()))
                .and(workspace(c.getWorkspace()))
                // availability
                .and(availableBetween(c.getCheckIn(), c.getCheckOut()));
    }

    /* ---------- text / region ---------- */

    public static Specification<Property> textSearch(String q) {
        if (q == null || q.isBlank()) return null;
        final String like = "%" + q.trim().toLowerCase(Locale.ROOT) + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), like),
                cb.like(cb.lower(root.get("description")), like),
                cb.like(cb.lower(root.get("location")), like)
        );
    }

    public static Specification<Property> regionContains(String regionSlug) {
        if (regionSlug == null || regionSlug.isBlank()) return null;
        final String like = "%" + regionSlug.trim().toLowerCase(Locale.ROOT) + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("location")), like);
    }

    /* ---------- numeric filters ---------- */

    public static Specification<Property> minPrice(java.math.BigDecimal min) {
        if (min == null) return null;
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("pricePerNight"), min);
    }

    public static Specification<Property> maxPrice(java.math.BigDecimal max) {
        if (max == null) return null;
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("pricePerNight"), max);
    }

    public static Specification<Property> bedroomsMin(Integer v) {
        if (v == null) return null;
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("bedrooms"), v);
    }

    public static Specification<Property> bathroomsMin(Integer v) {
        if (v == null) return null;
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("bathrooms"), v);
    }

    public static Specification<Property> bedsMin(Integer v) {
        if (v == null) return null;
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("beds"), v);
    }

    public static Specification<Property> guestsMin(Integer v) {
        if (v == null) return null;
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("maxGuests"), v);
    }

    public static Specification<Property> areaM2Min(Integer v) {
        if (v == null) return null;
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("areaM2"), v);
    }

    public static Specification<Property> minNightsMin(Integer v) {
        if (v == null) return null;
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("minNights"), v);
    }

    public static Specification<Property> maxDistCenterKm(Double v) {
        if (v == null) return null;
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("distanceToCenterKm"), v);
    }

    public static Specification<Property> maxDistBeachKm(Double v) {
        if (v == null) return null;
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("distanceToBeachKm"), v);
    }

    public static Specification<Property> wifiMin(Integer v) {
        if (v == null) return null;
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("wifiMbps"), v);
    }

    public static Specification<Property> propertyType(PropertyType t) {
        if (t == null) return null;
        return (root, query, cb) -> cb.equal(root.get("propertyType"), t);
    }

    public static Specification<Property> viewType(ViewType v) {
        if (v == null) return null;
        return (root, query, cb) -> cb.equal(root.get("viewType"), v);
    }

    /* ---------- availability ---------- */

    public static Specification<Property> availableBetween(LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null || !checkIn.isBefore(checkOut)) return null;

        return (root, query, cb) -> {
            // NOT EXISTS booking overlap (status = ACCEPTED)
            Subquery<Long> sq = query.subquery(Long.class);
            Root<Booking> b = sq.from(Booking.class);
            sq.select(cb.literal(1L))
                    .where(
                            cb.equal(b.get("property"), root),
                            cb.equal(b.get("status"), BookingStatus.ACCEPTED),
                            cb.lessThan(b.get("checkIn"), checkOut),
                            cb.greaterThan(b.get("checkOut"), checkIn)
                    );
            return cb.not(cb.exists(sq));
        };
    }

    /* ---------- amenities booleans: apply only if true ---------- */

    private static Specification<Property> isTrueIfRequested(Boolean v, String field) {
        if (v == null || !v) return null;
        return (root, query, cb) -> cb.isTrue(root.get(field));
    }

    public static Specification<Property> pool(Boolean v)            { return isTrueIfRequested(v, "pool"); }
    public static Specification<Property> parking(Boolean v)         { return isTrueIfRequested(v, "parking"); }
    public static Specification<Property> petFriendly(Boolean v)     { return isTrueIfRequested(v, "petFriendly"); }
    public static Specification<Property> smokingAllowed(Boolean v)  { return isTrueIfRequested(v, "smokingAllowed"); }
    public static Specification<Property> garden(Boolean v)          { return isTrueIfRequested(v, "garden"); }
    public static Specification<Property> terrace(Boolean v)         { return isTrueIfRequested(v, "terrace"); }
    public static Specification<Property> balcony(Boolean v)         { return isTrueIfRequested(v, "balcony"); }
    public static Specification<Property> hotTub(Boolean v)          { return isTrueIfRequested(v, "hotTub"); }
    public static Specification<Property> airConditioning(Boolean v) { return isTrueIfRequested(v, "airConditioning"); }
    public static Specification<Property> heating(Boolean v)         { return isTrueIfRequested(v, "heating"); }
    public static Specification<Property> accessible(Boolean v)      { return isTrueIfRequested(v, "accessible"); }
    public static Specification<Property> workspace(Boolean v)       { return isTrueIfRequested(v, "workspace"); }
}
