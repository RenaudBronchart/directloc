// booking/BookingService.java
package com.directloc.booking;

import com.directloc.property.Property;
import com.directloc.property.PropertyRepository;
import com.directloc.user.User;
import com.directloc.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository repo;
    private final PropertyRepository propertyRepo;
    private final UserRepository userRepo;

    public BookingService(BookingRepository repo, PropertyRepository propertyRepo, UserRepository userRepo) {
        this.repo = repo; this.propertyRepo = propertyRepo; this.userRepo = userRepo;
    }

    private User currentUser() {
        var email = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        return userRepo.findByEmail(email).orElseThrow();
    }

    @Transactional
    public Booking createAndConfirm(BookingRequest req){
        if (!req.checkOut().isAfter(req.checkIn())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "checkOut must be after checkIn");
        }

        int guestCount = req.adults() + req.children();

        //
        Property property = propertyRepo.lockById(req.propertyId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        if (property.getMaxGuests() != null && guestCount > property.getMaxGuests()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Too many guests for this property");
        }

        if (repo.existsOverlappingConfirmed(property.getId(), req.checkIn(), req.checkOut())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Dates not available");
        }

        long nights = ChronoUnit.DAYS.between(req.checkIn(), req.checkOut());
        if (nights <= 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid dates");

        BigDecimal total = property.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        Booking booking = Booking.builder()
                .property(property)
                .guest(currentUser())
                .checkIn(req.checkIn())
                .checkOut(req.checkOut())
                .adults(req.adults())
                .children(req.children())
                .rooms(req.rooms())
                .totalPrice(total)
                .status(BookingStatus.CONFIRMED)
                .build();

        return repo.save(booking);
    }

    public java.util.List<Booking> myBookings() {
        return repo.findMyBookings(currentUser().getEmail());
    }
}
