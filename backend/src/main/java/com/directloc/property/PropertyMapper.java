package com.directloc.property;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public final class PropertyMapper {

    private PropertyMapper() {
        // Utility class: no instances
    }

    /**
     * Maps a Property JPA entity to a PropertyResponse DTO.
     *
     * Notes:
     * - Accessing p.getOwner().getEmail() will initialize the lazy proxy; make sure
     *   you call this inside a transactional boundary (service layer) to avoid
     *   LazyInitializationException.
     * - If owner is null (shouldn't happen due to not-null FK), we guard it anyway.
     */
    public static PropertyResponse toDto(Property p) {
        if (p == null) return null;

        return PropertyResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .location(p.getLocation())
                .pricePerNight(p.getPricePerNight())
                .coverUrl(p.getCoverUrl())
                .bedrooms(p.getBedrooms())
                .bathrooms(p.getBathrooms())
                .maxGuests(p.getMaxGuests())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .ownerEmail(p.getOwner() != null ? p.getOwner().getEmail() : null)
                // TIP: if you add ownerId to the DTO, map it here too:
                // .ownerId(p.getOwner() != null ? p.getOwner().getId() : null)
                .build();
    }

    /**
     * Convenience method to map collections in one line.
     * Returns an empty list for null input.
     */
    public static List<PropertyResponse> toDtoList(Collection<Property> items) {
        if (items == null || items.isEmpty()) return List.of();
        return items.stream()
                .filter(Objects::nonNull)
                .map(PropertyMapper::toDto)
                .collect(Collectors.toList());
    }
}
