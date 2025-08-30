// src/main/java/com/directloc/property/PropertyService.java
package com.directloc.property;

import com.directloc.user.User;
import com.directloc.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Application service for Properties.
 *
 * Responsibilities:
 *  - Create/update/delete properties owned by the authenticated user.
 *  - Public search with pagination.
 *  - “My properties” for the current owner.
 */
@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository repo;
    private final UserService userService;

    /** Trim a string or return null if empty/blank (keeps DB clean). */
    private String trimOrNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    /** Create a property owned by the current user. */
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

    /**
     * Public search (paged).
     * Uses a single repository method (searchAvailable*) so availability rules live in one place.
     * For now we don't pass dates; when you add date filters, switch to repo.searchAvailable(q, guests, checkIn, checkOut, pageable).
     */
    public Page<PropertyResponse> search(String q, Integer adults, Integer children, Integer rooms, Pageable pageable) {
        // Derive minimum guest capacity from adults + children
        Integer guests = null;
        int a = adults != null ? adults : 1;  // reasonable default so results are meaningful
        int c = children != null ? children : 0;
        int totalGuests = a + c;
        if (totalGuests > 0) guests = totalGuests;

        // If q is blank, let repo.findAll(pageable) handle it; otherwise call the unified search
        Page<Property> page = (q != null && !q.isBlank())
                ? repo.searchAvailableNoDates(q, guests, pageable)
                : repo.findAll(pageable);

        return page.map(PropertyMapper::toDto);
    }

    /** Find a single property and map to DTO. */
    public Optional<PropertyResponse> findDtoById(UUID id) {
        return repo.findById(id).map(PropertyMapper::toDto);
    }

    /** List properties owned by the authenticated user. */
    public List<PropertyResponse> findMyProperties() {
        User owner = userService.getCurrentUser();
        return repo.findByOwner(owner).stream()
                .map(PropertyMapper::toDto)
                .toList();
    }

    /** Update a property (only by its owner). */
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

    /** Delete a property (only by its owner). */
    public void delete(UUID id) {
        Property p = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        User me = userService.getCurrentUser();
        if (!p.getOwner().getId().equals(me.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
        }

        repo.delete(p);
    }
}
