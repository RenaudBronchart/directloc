package com.directloc.property;

public final class PropertyMapper {
    private PropertyMapper() {}

    public static PropertyResponse toDto(Property p) {
        return PropertyResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())  // 👈 on mappe la description
                .location(p.getLocation())
                .pricePerNight(p.getPricePerNight())
                .coverUrl(p.getCoverUrl())
                .bedrooms(p.getBedrooms())
                .bathrooms(p.getBathrooms())
                .maxGuests(p.getMaxGuests())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())      // 👈 map
                .ownerEmail(p.getOwner() != null ? p.getOwner().getEmail() : null) // 👈 map
                .build();
    }
}
