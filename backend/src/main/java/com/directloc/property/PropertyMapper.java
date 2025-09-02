package com.directloc.property;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Maps Property JPA entities to API DTOs.
 *
 * Note:
 * - We compute a display-friendly "location" from city/region.
 * - All extra fields are nullable; safe to evolve over time.
 * - Accessing owner email will initialize the lazy proxy — call within a service
 *   method (transactional) to avoid LazyInitializationException.
 */
public final class PropertyMapper {

    private PropertyMapper() {
        // Utility class: no instances
    }

    public static PropertyResponse toDto(Property p) {
        if (p == null) return null;

        return PropertyResponse.builder()
                // identity
                .id(p.getId())

                // basic
                .title(p.getTitle())
                .description(p.getDescription())
                .region(p.getRegion())
                .city(p.getCity())
                .location(buildLocation(p.getCity(), p.getRegion()))

                // pricing/media
                .pricePerNight(p.getPricePerNight())
                .currency(p.getCurrency())
                .coverUrl(p.getCoverUrl())

                // capacity / size
                .maxGuests(p.getMaxGuests())
                .bedrooms(p.getBedrooms())
                .bathrooms(p.getBathrooms())
                .beds(p.getBeds())
                .areaM2(p.getAreaM2())

                // types
                .propertyType(p.getPropertyType())
                .viewType(p.getViewType())

                // amenities / rules
                .parking(p.getParking())
                .workspace(p.getWorkspace())
                .pool(p.getPool())
                .terrace(p.getTerrace())

                .petFriendly(p.getPetFriendly())
                .airConditioning(p.getAirConditioning())
                .hotTub(p.getHotTub())
                .balcony(p.getBalcony())

                .smokingAllowed(p.getSmokingAllowed())
                .heating(p.getHeating())
                .garden(p.getGarden())
                .accessible(p.getAccessible())

                .wifiMbps(p.getWifiMbps())
                .minNights(p.getMinNights())
                .checkInFrom(p.getCheckInFrom())
                .checkOutUntil(p.getCheckOutUntil())

                // distances
                .distanceToBeachKm(p.getDistanceToBeachKm())
                .distanceToCenterKm(p.getDistanceToCenterKm())

                // audit
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())

                // owner (PII)
                .ownerEmail(p.getOwner() != null ? p.getOwner().getEmail() : null)
                .build();
    }

    /** Friendly "City · Region" composition with graceful fallbacks. */
    private static String buildLocation(String city, String region) {
        final String c = (city == null || city.isBlank()) ? null : city.trim();
        final String r = (region == null || region.isBlank()) ? null : region.trim();
        if (c != null && r != null) return c + " · " + r;
        if (c != null) return c;
        if (r != null) return r;
        return null;
    }

    /** Convenience: maps collections and keeps order. */
    public static List<PropertyResponse> toDtoList(Collection<Property> items) {
        if (items == null || items.isEmpty()) return List.of();
        return items.stream()
                .filter(Objects::nonNull)
                .map(PropertyMapper::toDto)
                .collect(Collectors.toList());
        // If you prefer Java 16+: return items.stream().filter(Objects::nonNull).map(PropertyMapper::toDto).toList();
    }
}
