package com.directloc.property;

import com.directloc.user.User;
import com.directloc.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PropertyService {
    private final PropertyRepository repo;
    private final UserService userService;

    // -- helpers
    private String trimOrNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

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
                // 👇 convertit "" en null pour déclencher @PrePersist
                .coverUrl(trimOrNull(req.getCoverUrl()))
                .owner(owner)
                .build();
        return PropertyMapper.toDto(repo.save(p));
    }

    public Page<PropertyResponse> search(String q, Integer adults, Integer children, Integer rooms, Pageable pageable) {
        int guests = (adults != null ? adults : 1) + (children != null ? children : 0);

        Page<Property> page;
        if (q != null && !q.isBlank()) {
            if (guests > 0) {
                page = repo.findByLocationIgnoreCaseContainingAndMaxGuestsGreaterThanEqual(q, guests, pageable);
            } else {
                page = repo.findByLocationIgnoreCaseContaining(q, pageable);
            }
        } else {
            page = repo.findAll(pageable);
        }
        // TODO: si tu veux “rooms”, ajoute un where bedrooms >= rooms
        return page.map(PropertyMapper::toDto);
    }

    public Optional<PropertyResponse> findDtoById(UUID id) {
        return repo.findById(id).map(PropertyMapper::toDto);
    }

    public List<PropertyResponse> findMyProperties() {
        User owner = userService.getCurrentUser();
        return repo.findByOwner(owner).stream().map(PropertyMapper::toDto).toList();
    }

    public PropertyResponse update(UUID id, PropertyRequest req) {
        Property p = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Property not found"));
        User me = userService.getCurrentUser();
        if (!p.getOwner().getId().equals(me.getId())) throw new SecurityException("Forbidden");

        p.setTitle(req.getTitle().trim());
        p.setDescription(req.getDescription().trim());
        p.setLocation(req.getLocation().trim());
        p.setPricePerNight(req.getPricePerNight());
        p.setBedrooms(req.getBedrooms());
        p.setBathrooms(req.getBathrooms());
        p.setMaxGuests(req.getMaxGuests());
        // 👇 idem en update pour déclencher @PreUpdate si vide
        p.setCoverUrl(trimOrNull(req.getCoverUrl()));

        return PropertyMapper.toDto(repo.save(p));
    }
    public void delete(UUID id) {
        Property p = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Property not found"));
        User me = userService.getCurrentUser();
        if (!p.getOwner().getId().equals(me.getId())) throw new SecurityException("Forbidden");
        repo.delete(p);
    }
}
