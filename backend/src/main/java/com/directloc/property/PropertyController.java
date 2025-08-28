package com.directloc.property;

import com.directloc.booking.Booking;
import com.directloc.booking.BookingRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService service;
    private final BookingRepository bookingRepo;

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

    // 🔎 search + pagination
    @GetMapping
    public Page<PropertyResponse> findAll(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Integer adults,
            @RequestParam(required = false) Integer children,
            @RequestParam(required = false) Integer rooms,
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return service.search(q, adults, children, rooms, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropertyResponse> findById(@PathVariable UUID id) {
        return service.findDtoById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my")
    public List<PropertyResponse> my() {
        return service.findMyProperties();
    }

    @GetMapping("/{id}/booked-days")
    public Map<String, List<String>> getBookedDays(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        var bookings = bookingRepo.findConfirmedOverlapping(id, from, to);
        
        Set<String> days = new HashSet<>();
        for (Booking b : bookings) {
            for (LocalDate d = b.getCheckIn(); d.isBefore(b.getCheckOut()); d = d.plusDays(1)) {
                days.add(d.toString()); // yyyy-MM-dd
            }
        }
        var sorted = days.stream().sorted().toList();
        return Map.of("days", sorted);
    }
}
