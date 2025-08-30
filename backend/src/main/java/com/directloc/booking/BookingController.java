// src/main/java/com/directloc/booking/BookingController.java
package com.directloc.booking;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Booking REST endpoints.
 *
 * Responsibility boundaries:
 * - Guest actions:
 *   - POST /api/bookings                    -> submit a booking request (pending)
 *   - PATCH /api/bookings/{id}/cancel       -> cancel own booking (policy enforced in service)
 *
 * - Owner (host) actions:
 *   - PATCH /api/bookings/{id}/approve      -> approve a request for a property they own
 *   - PATCH /api/bookings/{id}/decline      -> decline a request for a property they own
 *
 * - Queries:
 *   - GET   /api/bookings/my                -> current user's bookings (as guest)
 *   - GET   /api/bookings/{id}              -> details of a booking IF it belongs to current user
 *
 * Notes:
 * - Authorization/ownership checks live in BookingService.
 * - Controller only orchestrates and maps DTOs.
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    /** Guest: submit a booking request (will be PENDING). */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse create(@Valid @RequestBody BookingRequest req) {
        return BookingMapper.toDto(service.createRequest(req));
    }

    /** Owner: approve a pending booking (must own the property). */
    @PatchMapping("/{id}/approve")
    public BookingResponse approve(@PathVariable Long id) {
        return BookingMapper.toDto(service.approveByOwner(id));
    }

    /** Owner: decline a pending booking (must own the property). */
    @PatchMapping("/{id}/decline")
    public BookingResponse decline(@PathVariable Long id) {
        return BookingMapper.toDto(service.declineByOwner(id));
    }

    /** Guest: cancel own booking (policy enforced in service). */
    @PatchMapping("/{id}/cancel")
    public BookingResponse cancel(@PathVariable Long id) {
        return BookingMapper.toDto(service.cancelForCurrentUser(id));
    }

    /** Guest: list my bookings (as current user / guest). */
    @GetMapping("/my")
    public List<BookingResponse> my() {
        return service.myBookings().stream().map(BookingMapper::toDto).toList();
    }

    /** Guest: get a booking if it belongs to current user. */
    @GetMapping("/{id}")
    public BookingResponse getById(@PathVariable Long id) {
        return BookingMapper.toDto(service.getForCurrentUser(id));
    }

    /*
     * (Optional, for host dashboard)
     * Owner: list bookings for a property they own.
     */

    @GetMapping("/property/{propertyId}")
    public List<BookingResponse> byProperty(@PathVariable UUID propertyId) {
          return service.bookingsForOwnerProperty(propertyId)
                       .stream().map(BookingMapper::toDto).toList();
    }

}
