// src/main/java/com/directloc/property/PropertyController.java
package com.directloc.property;

import com.directloc.booking.Booking;
import com.directloc.booking.BookingRepository;
import com.directloc.property.search.PropertySearchCriteria;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService service;
    private final BookingRepository bookingRepo;

    /* ===================== CRUD ===================== */

    @PostMapping
    public ResponseEntity<PropertyResponse> create(@RequestBody @Valid PropertyRequest request) {
        return ResponseEntity.status(201).body(service.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PropertyResponse> update(@PathVariable UUID id, @RequestBody @Valid PropertyRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropertyResponse> findById(@PathVariable UUID id) {
        return service.findDtoById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my")
    public List<PropertyResponse> my() {
        return service.findMyProperties();
    }

    /* ===================== SEARCH (GET with query params) ===================== */
    @GetMapping
    public Page<PropertyResponse> findAll(
            // text / region
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String region,

            // legacy headcount (adults + children) and shorthand rooms
            @RequestParam(required = false) Integer adults,
            @RequestParam(required = false) Integer children,
            @RequestParam(required = false) Integer rooms, // legacy UI shortcut → bedroomsMin

            // numeric filters
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer bedroomsMin,
            @RequestParam(required = false) Integer bathroomsMin,
            @RequestParam(required = false) Integer bedsMin,
            @RequestParam(required = false) Integer guestsMin,
            @RequestParam(required = false) Integer areaM2Min,
            @RequestParam(required = false) Integer minNightsMin,

            // distances
            @RequestParam(required = false) Double maxDistCenterKm,
            @RequestParam(required = false) Double maxDistBeachKm,

            // connectivity
            @RequestParam(required = false) Integer wifiMin,

            // types (enums de tu paquete com.directloc.property)
            @RequestParam(required = false) PropertyType propertyType,
            @RequestParam(required = false) ViewType viewType,

            // amenities (booleans: si true → filtra; si null/false → no aplica filtro)
            @RequestParam(required = false) Boolean pool,
            @RequestParam(required = false) Boolean parking,
            @RequestParam(required = false, name = "petFriendly") Boolean petFriendly,
            @RequestParam(required = false) Boolean smokingAllowed,
            @RequestParam(required = false) Boolean garden,
            @RequestParam(required = false) Boolean terrace,
            @RequestParam(required = false) Boolean balcony,
            @RequestParam(required = false) Boolean hotTub,
            @RequestParam(required = false) Boolean airConditioning,
            @RequestParam(required = false) Boolean heating,
            @RequestParam(required = false) Boolean accessible,
            @RequestParam(required = false) Boolean workspace,

            // dates
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,

            // optional sort selector (otherwise use Pageable sort)
            @RequestParam(required = false) PropertySearchCriteria.SortBy sortBy,

            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        // Normalize simple inputs
        String regionNorm = (region == null) ? null : region.trim();
        String qNorm = (q == null) ? null : q.trim();

        // Build criteria DTO
        PropertySearchCriteria c = new PropertySearchCriteria();
        c.setQ(qNorm);
        c.setRegion(regionNorm);

        // Ensure min/max price are consistent (swap if reversed)
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            BigDecimal tmp = minPrice;
            minPrice = maxPrice;
            maxPrice = tmp;
        }
        c.setMinPrice(minPrice);
        c.setMaxPrice(maxPrice);

        // Merge legacy "rooms" into bedroomsMin
        if (rooms != null && rooms > 0) {
            bedroomsMin = (bedroomsMin == null) ? rooms : Math.max(bedroomsMin, rooms);
        }
        c.setBedroomsMin(bedroomsMin);
        c.setBathroomsMin(bathroomsMin);
        c.setBedsMin(bedsMin);

        // guestsMin: si no viene, calcula adults+children
        if (guestsMin == null) {
            int total = (adults != null ? adults : 0) + (children != null ? children : 0);
            if (total > 0) c.setGuestsMin(total);
        } else {
            c.setGuestsMin(guestsMin);
        }

        // surface & stay
        c.setAreaM2Min(areaM2Min);
        c.setMinNightsMin(minNightsMin);

        // distances
        c.setMaxDistCenterKm(maxDistCenterKm);
        c.setMaxDistBeachKm(maxDistBeachKm);

        // connectivity
        c.setWifiMin(wifiMin);

        // types
        c.setPropertyType(propertyType);
        c.setViewType(viewType);

        // amenities (usar lo recibido, nada de hardcodear true)
        c.setPool(pool);
        c.setParking(parking);
        c.setPetFriendly(petFriendly);
        c.setSmokingAllowed(smokingAllowed);
        c.setGarden(garden);
        c.setTerrace(terrace);
        c.setBalcony(balcony);
        c.setHotTub(hotTub);
        c.setAirConditioning(airConditioning);
        c.setHeating(heating);
        c.setAccessible(accessible);
        c.setWorkspace(workspace);

        // dates
        c.setCheckIn(checkIn);
        c.setCheckOut(checkOut);

        c.setSortBy(sortBy);

        return service.search(c, pageable);
    }

    /* ===================== SEARCH (POST with JSON body) ===================== */
    @PostMapping("/search")
    public Page<PropertyResponse> search(@RequestBody PropertySearchCriteria criteria,
                                         @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return service.search(criteria, pageable);
    }

    /* ===================== BOOKED DAYS ===================== */

    /**
     * Returns booked (unavailable) days for a property in the given [from, to) window.
     * Uses ACCEPTED bookings and returns ISO dates ("yyyy-MM-dd").
     */
    @GetMapping("/{id}/booked-days")
    public Map<String, List<String>> getBookedDays(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        if (from == null || to == null || !from.isBefore(to)) {
            return Map.of("days", List.of());
        }

        var bookings = bookingRepo.findAcceptedOverlapping(id, from, to);

        // Keep natural ascending order while building
        Set<String> days = new TreeSet<>();

        // Intersection of [checkIn, checkOut) with [from, to)
        for (Booking b : bookings) {
            LocalDate start = b.getCheckIn().isAfter(from) ? b.getCheckIn() : from;
            LocalDate end   = b.getCheckOut().isBefore(to) ? b.getCheckOut() : to;

            for (LocalDate d = start; d.isBefore(end); d = d.plusDays(1)) {
                days.add(d.toString()); // ISO-8601 yyyy-MM-dd
            }
        }

        return Map.of("days", List.copyOf(days));
    }
}
