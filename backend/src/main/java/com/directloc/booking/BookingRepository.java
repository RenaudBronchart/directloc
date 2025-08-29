// src/main/java/com/directloc/booking/BookingRepository.java
package com.directloc.booking;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.*;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    /* ========= Overlap checks ========= */

    //  Use ACCEPTED as the “blocking” status to avoid overbooking.
    @Query("""
        select (count(b) > 0) from Booking b
        where b.property.id = :propertyId
          and b.status = com.directloc.booking.BookingStatus.ACCEPTED
          and b.checkIn < :checkOut and b.checkOut > :checkIn
    """)
    boolean existsOverlappingAccepted(@Param("propertyId") UUID propertyId,
                                      @Param("checkIn") LocalDate checkIn,
                                      @Param("checkOut") LocalDate checkOut);

    /* ========= My bookings (guest) ========= */

    @Query("""
        select b from Booking b
        where b.guest.email = :email
        order by b.createdAt desc
    """)
    List<Booking> findMyBookings(@Param("email") String email);

    @Query("""
        select b from Booking b
        where b.guest.id = :guestId
        order by b.createdAt desc
    """)
    List<Booking> findMyBookingsByGuestId(@Param("guestId") Long guestId);

    /* ========= Security-scoped lookups ========= */

    // Guest can see their own booking
    @Query("""
        select b from Booking b
        where b.id = :id and b.guest.email = :email
    """)
    Optional<Booking> findByIdAndGuestEmail(@Param("id") Long id,
                                            @Param("email") String email);

    // Owner can moderate a booking only if they own the property
    @Query("""
        select b from Booking b
        where b.id = :id and b.property.owner.email = :ownerEmail
    """)
    Optional<Booking> findByIdAndPropertyOwnerEmail(@Param("id") Long id,
                                                    @Param("ownerEmail") String ownerEmail);

    /* ========= Host: list bookings for a property ========= */

    @Query("""
        select b from Booking b
        where b.property.id = :propertyId
        order by b.createdAt desc
    """)
    List<Booking> findByPropertyIdOrderByCreatedAtDesc(@Param("propertyId") UUID propertyId);

    /* ========= Calendar helper (booked days) =========
       Legacy name kept for compatibility with your current controller:
       it now returns ACCEPTED bookings that overlap the window.
    */

    @Query("""
        select b from Booking b
        where b.property.id = :propertyId
          and b.status = com.directloc.booking.BookingStatus.ACCEPTED
          and b.checkIn < :to and b.checkOut > :from
    """)
    List<Booking> findConfirmedOverlapping(@Param("propertyId") UUID propertyId,
                                           @Param("from") LocalDate from,
                                           @Param("to") LocalDate to);

    // New name (identical query). Prefer this in new code.
    @Query("""
        select b from Booking b
        where b.property.id = :propertyId
          and b.status = com.directloc.booking.BookingStatus.ACCEPTED
          and b.checkIn < :to and b.checkOut > :from
    """)
    List<Booking> findAcceptedOverlapping(@Param("propertyId") UUID propertyId,
                                          @Param("from") LocalDate from,
                                          @Param("to") LocalDate to);
}
