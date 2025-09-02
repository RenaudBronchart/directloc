// src/main/java/com/directloc/property/search/PropertySpecifications.java
package com.directloc.property.search;

import com.directloc.booking.Booking;
import com.directloc.booking.BookingStatus;
import com.directloc.property.Property;
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
                .and(minPrice(c.getMinPrice()))
                .and(maxPrice(c.getMaxPrice()))
                .and(bedroomsMin(c.getBedroomsMin()))
                .and(bathroomsMin(c.getBathroomsMin()))
                .and(guestsMin(c.getGuestsMin()))
                .and(availableBetween(c.getCheckIn(), c.getCheckOut()))
                // Amenities are placeholders until you persist them:
                .and(pool(c.getPool()))
                .and(parking(c.getParking()))
                .and(petsAllowed(c.getPetsAllowed()))
                .and(wifiMin(c.getWifiMin()));
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
        // For now we just match the human label or slug against location.
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

    public static Specification<Property> guestsMin(Integer v) {
        if (v == null) return null;
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("maxGuests"), v);
    }

    /* ---------- availability ---------- */

    public static Specification<Property> availableBetween(LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null || !checkIn.isBefore(checkOut)) return null;

        return (root, query, cb) -> {
            // NOT EXISTS (SELECT 1 FROM Booking b WHERE b.property = p
            //   AND b.status = ACCEPTED AND b.checkIn < :checkOut AND b.checkOut > :checkIn)
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

    /* ---------- amenities placeholders (no-op until persisted) ---------- */

    public static Specification<Property> pool(Boolean v)   { return nullIfFalse(v); }
    public static Specification<Property> parking(Boolean v){ return nullIfFalse(v); }
    public static Specification<Property> petsAllowed(Boolean v){ return nullIfFalse(v); }
    public static Specification<Property> wifiMin(Integer v){ return null; }

    private static Specification<Property> nullIfFalse(Boolean v) {
        // return null for now (no DB column). When you add columns, replace with cb.isTrue(root.get("features").get("pool")), etc.
        return null;
    }
}
