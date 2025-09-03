// src/main/java/com/directloc/property/PropertyService.java
package com.directloc.property;

import com.directloc.property.search.PropertySearchCriteria;
import com.directloc.property.search.PropertySpecifications;
import com.directloc.user.User;
import com.directloc.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository repo;
    private final UserService userService;

    /* ------------ Utilities ------------ */

    /** Trim o null si queda vacío (mantiene la BD limpia). */
    private String trimOrNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    /** Parsers seguros para enums: devuelven null si la cadena es inválida. */
    private PropertyType parseType(String s) {
        if (s == null || s.isBlank()) return null;
        try { return PropertyType.valueOf(s.trim().toUpperCase()); }
        catch (IllegalArgumentException ex) { return null; }
    }
    private ViewType parseView(String s) {
        if (s == null || s.isBlank()) return null;
        try { return ViewType.valueOf(s.trim().toUpperCase()); }
        catch (IllegalArgumentException ex) { return null; }
    }

    /** Para la búsqueda legacy (GET). */
    private PropertySearchCriteria fromLegacyParams(String q, Integer adults, Integer children, Integer rooms) {
        PropertySearchCriteria c = new PropertySearchCriteria();
        c.setQ(q);

        int a = adults != null ? adults : 0;
        int k = children != null ? children : 0;
        int total = a + k;
        if (total > 0) c.setGuestsMin(total);

        return c;
    }

    /** Permite override de ordenación vía criteria.sortBy. */
    private Pageable applySortOverride(PropertySearchCriteria c, Pageable pageable) {
        if (c == null || c.getSortBy() == null) return pageable;

        Sort sort;
        switch (c.getSortBy()) {
            case PRICE_ASC  -> sort = Sort.by(Sort.Order.asc("pricePerNight"));
            case PRICE_DESC -> sort = Sort.by(Sort.Order.desc("pricePerNight"));
            case GUESTS_DESC-> sort = Sort.by(Sort.Order.desc("maxGuests"));
            case NEWEST     -> sort = Sort.by(Sort.Order.desc("createdAt"));
            default -> sort = pageable.getSort().isSorted()
                    ? pageable.getSort()
                    : Sort.by(Sort.Order.desc("createdAt"));
        }
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
    }

    /* ------------ Commands ------------ */

    @Transactional
    public PropertyResponse create(PropertyRequest req) {
        User owner = userService.getCurrentUser();

        Property p = Property.builder()
                // --- básicos ---
                .title(req.getTitle().trim())
                .description(req.getDescription().trim())
                .region(trimOrNull(req.getRegion()))
                .city(trimOrNull(req.getCity()))
                .location(trimOrNull(req.getLocation()))  // si queda vacío, la entidad lo derivará
                .pricePerNight(req.getPricePerNight())
                .currency(trimOrNull(req.getCurrency()))
                // --- capacidades / superficie ---
                .maxGuests(req.getMaxGuests())
                .bedrooms(req.getBedrooms())
                .bathrooms(req.getBathrooms())
                .beds(req.getBeds())
                .areaM2(req.getAreaM2())
                // --- tipos ---
                .propertyType(parseType(req.getPropertyType()))
                .viewType(parseView(req.getViewType()))
                // --- amenities / reglas ---
                .parking(req.getParking())
                .workspace(req.getWorkspace())
                .pool(req.getPool())
                .terrace(req.getTerrace())
                .petFriendly(req.getPetFriendly())
                .airConditioning(req.getAirConditioning())
                .hotTub(req.getHotTub())
                .balcony(req.getBalcony())
                .smokingAllowed(req.getSmokingAllowed())
                .heating(req.getHeating())
                .garden(req.getGarden())
                .accessible(req.getAccessible())
                // --- cuantificables ---
                .wifiMbps(req.getWifiMbps())
                .minNights(req.getMinNights())
                .checkInFrom(req.getCheckInFrom())
                .checkOutUntil(req.getCheckOutUntil())
                .distanceToBeachKm(req.getDistanceToBeachKm())
                .distanceToCenterKm(req.getDistanceToCenterKm())
                // --- media / ownership ---
                .coverUrl(trimOrNull(req.getCoverUrl()))
                .owner(owner)
                .build();

        // La entidad tiene @PrePersist/@PreUpdate para currency/location/cover por defecto.
        return PropertyMapper.toDto(repo.save(p));
    }

    @Transactional
    public PropertyResponse update(UUID id, PropertyRequest req) {
        Property p = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        User me = userService.getCurrentUser();
        if (!p.getOwner().getId().equals(me.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
        }

        // --- básicos ---
        p.setTitle(req.getTitle().trim());
        p.setDescription(req.getDescription().trim());
        p.setRegion(trimOrNull(req.getRegion()));
        p.setCity(trimOrNull(req.getCity()));
        p.setLocation(trimOrNull(req.getLocation())); // si queda vacío, se derivará en @PreUpdate
        p.setPricePerNight(req.getPricePerNight());
        p.setCurrency(trimOrNull(req.getCurrency()));

        // --- capacidades / superficie ---
        p.setMaxGuests(req.getMaxGuests());
        p.setBedrooms(req.getBedrooms());
        p.setBathrooms(req.getBathrooms());
        p.setBeds(req.getBeds());
        p.setAreaM2(req.getAreaM2());

        // --- tipos ---
        p.setPropertyType(parseType(req.getPropertyType()));
        p.setViewType(parseView(req.getViewType()));

        // --- amenities / reglas ---
        p.setParking(req.getParking());
        p.setWorkspace(req.getWorkspace());
        p.setPool(req.getPool());
        p.setTerrace(req.getTerrace());
        p.setPetFriendly(req.getPetFriendly());
        p.setAirConditioning(req.getAirConditioning());
        p.setHotTub(req.getHotTub());
        p.setBalcony(req.getBalcony());
        p.setSmokingAllowed(req.getSmokingAllowed());
        p.setHeating(req.getHeating());
        p.setGarden(req.getGarden());
        p.setAccessible(req.getAccessible());

        // --- cuantificables ---
        p.setWifiMbps(req.getWifiMbps());
        p.setMinNights(req.getMinNights());
        p.setCheckInFrom(req.getCheckInFrom());
        p.setCheckOutUntil(req.getCheckOutUntil());
        p.setDistanceToBeachKm(req.getDistanceToBeachKm());
        p.setDistanceToCenterKm(req.getDistanceToCenterKm());

        // --- media ---
        p.setCoverUrl(trimOrNull(req.getCoverUrl()));

        return PropertyMapper.toDto(repo.save(p));
    }

    @Transactional
    public void delete(UUID id) {
        Property p = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        User me = userService.getCurrentUser();
        if (!p.getOwner().getId().equals(me.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
        }

        repo.delete(p);
    }

    /* ------------ Queries ------------ */

    @Transactional(readOnly = true)
    public Page<PropertyResponse> search(String q, Integer adults, Integer children, Integer rooms, Pageable pageable) {
        PropertySearchCriteria criteria = fromLegacyParams(q, adults, children, rooms);
        return search(criteria, pageable);
    }

    @Transactional(readOnly = true)
    public Page<PropertyResponse> search(PropertySearchCriteria criteria, Pageable pageable) {
        PropertySearchCriteria safe = (criteria != null) ? criteria : new PropertySearchCriteria();
        Specification<Property> spec = PropertySpecifications.byCriteria(safe);

        Pageable effective = applySortOverride(safe, pageable);
        Page<Property> page = repo.findAll(spec, effective);

        return page.map(PropertyMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<PropertyResponse> findDtoById(UUID id) {
        return repo.findById(id).map(PropertyMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<PropertyResponse> findMyProperties() {
        User owner = userService.getCurrentUser();
        return repo.findByOwner(owner).stream()
                .map(PropertyMapper::toDto)
                .toList();
    }
}
