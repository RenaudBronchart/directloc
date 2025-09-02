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

/**
 * Application service for Properties.
 *
 * Responsibilities:
 *  - Create/update/delete properties owned by the authenticated user.
 *  - Public search with pagination (legacy GET and new criteria-based endpoints).
 *  - “My properties” for the current owner.
 *
 * NOTE: Repository must extend JpaSpecificationExecutor<Property> for the criteria search.
 */
@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository repo;
    private final UserService userService;

    /* ------------ Utilities ------------ */

    /** Trim a string or return null if empty/blank (keeps DB clean). */
    private String trimOrNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    /** Build criteria from the legacy GET search params. */
    private PropertySearchCriteria fromLegacyParams(String q, Integer adults, Integer children, Integer rooms) {
        PropertySearchCriteria c = new PropertySearchCriteria();
        c.setQ(q);

        // guestsMin = (adults + children) if provided (> 0)
        int a = adults != null ? adults : 0;
        int k = children != null ? children : 0;
        int total = a + k;
        if (total > 0) c.setGuestsMin(total);

        // rooms kept for future mapping if needed (controller now maps it)
        return c;
    }

    /** Allow sort override via criteria.sortBy when Pageable is unsorted or you want to force it. */
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
                .title(req.getTitle().trim())
                .description(req.getDescription().trim())
                .location(req.getLocation().trim())
                .pricePerNight(req.getPricePerNight())
                .bedrooms(req.getBedrooms())
                .bathrooms(req.getBathrooms())
                .maxGuests(req.getMaxGuests())
                .coverUrl(trimOrNull(req.getCoverUrl()))
                .owner(owner)
                .build();

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

        p.setTitle(req.getTitle().trim());
        p.setDescription(req.getDescription().trim());
        p.setLocation(req.getLocation().trim());
        p.setPricePerNight(req.getPricePerNight());
        p.setBedrooms(req.getBedrooms());
        p.setBathrooms(req.getBathrooms());
        p.setMaxGuests(req.getMaxGuests());
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
