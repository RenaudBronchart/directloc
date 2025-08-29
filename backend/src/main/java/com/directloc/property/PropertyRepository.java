// src/main/java/com/directloc/property/PropertyRepository.java
package com.directloc.property;

import com.directloc.user.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Property entity.
 *
 * Notes:
 * - lockById(): PESSIMISTIC_WRITE is used during booking creation to avoid race conditions.
 * - searchAvailable(): excludes properties that have any ACCEPTED booking overlapping
 *   the requested window.
 */
public interface PropertyRepository extends JpaRepository<Property, UUID> {

    /** Owner listings */
    List<Property> findByOwner(User owner);

    /** Row lock used by BookingService to prevent overbooking races */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Property p where p.id = :id")
    Optional<Property> lockById(@Param("id") UUID id);

    /**
     * Search with optional filters:
     *  - q: substring match on location (case-insensitive)
     *  - guests: minimum capacity
     *  - availability window [checkIn, checkOut): exclude props with ACCEPTED overlap
     */
    @Query("""
        select p from Property p
        where (:q is null or lower(p.location) like lower(concat('%', :q, '%')))
          and (:guests is null or p.maxGuests >= :guests)
          and (
            :checkIn is null or :checkOut is null
            or not exists (
              select b.id from Booking b
              where b.property = p
                and b.status = com.directloc.booking.BookingStatus.ACCEPTED
                and b.checkIn < :checkOut and b.checkOut > :checkIn
            )
          )
        """)
    Page<Property> searchAvailable(@Param("q") String q,
                                   @Param("guests") Integer guests,
                                   @Param("checkIn") LocalDate checkIn,
                                   @Param("checkOut") LocalDate checkOut,
                                   Pageable pageable);

    /** Convenience overload when you don't filter by dates */
    default Page<Property> searchAvailableNoDates(String q, Integer guests, Pageable pageable) {
        return searchAvailable(q, guests, null, null, pageable);
    }
}
