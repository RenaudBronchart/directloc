package com.directloc.property;

import com.directloc.user.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PropertyRepository extends JpaRepository<Property, UUID> {
    List<Property> findByOwner(User owner);

    Page<Property> findAll(Pageable pageable);

    Page<Property> findByLocationIgnoreCaseContaining(String q, Pageable pageable);

    Page<Property> findByLocationIgnoreCaseContainingAndMaxGuestsGreaterThanEqual(
            String q, Integer guests, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Property p where p.id = :id")
    Optional<Property> lockById(@Param("id") UUID id);


    @Query("""
  select p from Property p
  where (:q is null or lower(p.location) like lower(concat('%', :q, '%')))
    and (:guests is null or p.maxGuests >= :guests)
    and (
      :checkIn is null or :checkOut is null
      or not exists (
        select b.id from Booking b
        where b.property = p
          and b.status = com.directloc.booking.BookingStatus.CONFIRMED
          and b.checkIn < :checkOut and b.checkOut > :checkIn
      )
    )
""")
    org.springframework.data.domain.Page<Property> searchAvailable(
            @org.springframework.data.repository.query.Param("q") String q,
            @org.springframework.data.repository.query.Param("guests") Integer guests,
            @org.springframework.data.repository.query.Param("checkIn") java.time.LocalDate checkIn,
            @org.springframework.data.repository.query.Param("checkOut") java.time.LocalDate checkOut,
            org.springframework.data.domain.Pageable pageable
    );
}
