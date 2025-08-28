// booking/BookingRepository.java
package com.directloc.booking;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.*;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("""
      select (count(b) > 0) from Booking b
      where b.property.id = :propertyId
        and b.status = com.directloc.booking.BookingStatus.CONFIRMED
        and b.checkIn < :checkOut and b.checkOut > :checkIn
    """)
    boolean existsOverlappingConfirmed(@Param("propertyId") UUID propertyId,
                                       @Param("checkIn") LocalDate checkIn,
                                       @Param("checkOut") LocalDate checkOut);

    @Query("""
      select b from Booking b
      where b.guest.email = :email
      order by b.createdAt desc
    """)
    List<Booking> findMyBookings(@Param("email") String email);

    @Query("""
      select b from Booking b
      where b.property.id = :propertyId
        and b.status = com.directloc.booking.BookingStatus.CONFIRMED
        and b.checkIn < :to and b.checkOut > :from
    """)
    List<Booking> findConfirmedOverlapping(@Param("propertyId") UUID propertyId,
                                           @Param("from") LocalDate from,
                                           @Param("to") LocalDate to);


    @Query("""
  select b from Booking b
  where b.id = :id and b.guest.email = :email
""")
    Optional<Booking> findByIdAndGuestEmail(@Param("id") Long id,
                                            @Param("email") String email);

    @Query("""
  select b from Booking b
  where b.guest.id = :guestId
  order by b.createdAt desc
""")
    List<Booking> findMyBookingsByGuestId(@Param("guestId") Long guestId);
}
