package com.directloc.booking;

import com.directloc.property.Property;
import com.directloc.property.PropertyRepository;
import com.directloc.user.User;
import com.directloc.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

/**
 * Domain logic for the booking lifecycle:
 *  - Guest creates a REQUESTED booking.
 *  - Owner (host) can APPROVE (-> ACCEPTED) or DECLINE (-> DECLINED) if they own the property.
 *  - Guest can CANCEL under policy constraints.
 *
 * Concurrency:
 *  - We lock the Property row (propertyRepo.lockById) on creation to avoid race conditions.
 *  - We only consider ACCEPTED bookings as blocking for availability.
 */
@Service
public class BookingService {

    private final BookingRepository repo;
    private final PropertyRepository propertyRepo;
    private final UserRepository userRepo;

    public BookingService(BookingRepository repo, PropertyRepository propertyRepo, UserRepository userRepo) {
        this.repo = repo;
        this.propertyRepo = propertyRepo;
        this.userRepo = userRepo;
    }

    /** Returns the authenticated user entity (throws if not found). */
    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByEmail(email).orElseThrow();
    }

    // -------------------------
    // Guest — create REQUESTED
    // -------------------------
    @Transactional
    public Booking createRequest(BookingRequest req) {
        // 1) Validate dates (strictly after check-in; min 2 nights)
        if (!req.checkOut().isAfter(req.checkIn())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-out must be after check-in.");
        }
        long nights = ChronoUnit.DAYS.between(req.checkIn(), req.checkOut());
        if (nights < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Minimum stay is 2 nights.");
        }

        // 2) Validate counters (primitives are never null)
        int adults = req.adults();
        int children = req.children();
        int rooms = req.rooms();
        if (adults < 1)   throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Adults must be at least 1.");
        if (children < 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Children must be >= 0.");
        if (rooms < 1)    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rooms must be at least 1.");

        // 3) Lock property + capacity check
        Property property = propertyRepo.lockById(req.propertyId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        int guests = adults + children;
        Integer maxGuests = property.getMaxGuests(); // may be null
        if (maxGuests != null && guests > maxGuests) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Guests exceed property capacity.");
        }

        // 4) Overlapping: block if any ACCEPTED overlaps (REQUESTED can coexist)
        boolean acceptedOverlap = repo.existsOverlappingAccepted(property.getId(), req.checkIn(), req.checkOut());
        if (acceptedOverlap) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "These dates are already booked.");
        }

        // 5) Total price (simple: nights * pricePerNight)
        BigDecimal total = property.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        // 6) Persist REQUESTED
        Booking b = Booking.builder()
                .property(property)
                .guest(currentUser())
                .checkIn(req.checkIn())
                .checkOut(req.checkOut())
                .adults(adults)
                .children(children)
                .rooms(rooms)
                .totalPrice(total)
                .status(BookingStatus.REQUESTED)
                .build();

        return repo.save(b);
    }

    // -------------------------
    // Owner — approve / decline
    // -------------------------
    @Transactional
    public Booking approveByOwner(Long id) {
        // Only the owner of the property can approve this booking
        String email = currentUser().getEmail();
        Booking b = repo.findByIdAndPropertyOwnerEmail(id, email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your property / booking"));

        if (b.getStatus() != BookingStatus.REQUESTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only requested bookings can be accepted.");
        }

        // Ensure no other ACCEPTED booking overlaps
        boolean acceptedOverlap = repo.existsOverlappingAccepted(
                b.getProperty().getId(), b.getCheckIn(), b.getCheckOut());
        if (acceptedOverlap) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Dates already accepted for another booking.");
        }

        b.setStatus(BookingStatus.ACCEPTED);
        return repo.save(b);
    }

    @Transactional
    public Booking declineByOwner(Long id) {
        String email = currentUser().getEmail();
        Booking b = repo.findByIdAndPropertyOwnerEmail(id, email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your property / booking"));

        if (b.getStatus() != BookingStatus.REQUESTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only requested bookings can be declined.");
        }

        b.setStatus(BookingStatus.DECLINED);
        return repo.save(b);
    }

    // -------------------------
    // Guest — view & list
    // -------------------------
    public Booking getForCurrentUser(Long id) {
        String email = currentUser().getEmail();
        return repo.findByIdAndGuestEmail(id, email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your booking"));
    }

    public List<Booking> myBookings() {
        return repo.findMyBookings(currentUser().getEmail());
    }

    // -------------------------
    // Guest — cancel
    // -------------------------
    @Transactional
    public Booking cancelForCurrentUser(Long id) {
        String email = currentUser().getEmail();
        Booking b = repo.findByIdAndGuestEmail(id, email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your booking"));

        if (b.getStatus() == BookingStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking already cancelled.");
        }
        if (b.getStatus() == BookingStatus.DECLINED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Declined bookings cannot be cancelled.");
        }

        // Policy:
        // - If ACCEPTED, enforce >= 48h before check-in.
        // - If REQUESTED (pending), allow cancel anytime.
        if (b.getStatus() == BookingStatus.ACCEPTED) {
            LocalDate now = LocalDate.now();
            long hoursToCheckIn = Duration.between(now.atStartOfDay(), b.getCheckIn().atStartOfDay()).toHours();
            if (hoursToCheckIn < 48) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "This booking can no longer be cancelled (less than 48h before check-in)."
                );
            }
        }

        b.setStatus(BookingStatus.CANCELLED);
        return repo.save(b);
    }

    // -----------------------------------------
    // Owner — list bookings for owned property
    // -----------------------------------------
    public List<Booking> bookingsForOwnerProperty(UUID propertyId) {
        String email = currentUser().getEmail();
        // Ensure the property exists AND is owned by current user
        Property p = propertyRepo.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));
        if (!email.equalsIgnoreCase(p.getOwner().getEmail())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your property");
        }
        // Return bookings ordered by creation date (most recent first)
        return repo.findByPropertyIdOrderByCreatedAtDesc(propertyId);
    }
}
