// src/main/java/com/directloc/messaging/ConversationRepository.java
package com.directloc.messaging;

import jakarta.persistence.QueryHint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.hibernate.jpa.HibernateHints.HINT_READ_ONLY;

/** Data access for conversation threads. */
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    Optional<Conversation> findByPropertyIdAndOwnerIdAndGuestId(UUID propertyId, Long ownerId, Long guestId);

    @Query("""
     select c from Conversation c
     where c.owner.id = :userId or c.guest.id = :userId
     order by c.lastMessageAt desc nulls last, c.createdAt desc
  """)
    @QueryHints(@QueryHint(name = HINT_READ_ONLY, value = "true"))
    List<Conversation> findAllForUser(@Param("userId") Long userId);

    @Query("""
     select c from Conversation c
     where c.id = :id and (c.owner.id = :userId or c.guest.id = :userId)
  """)
    Optional<Conversation> findByIdForParticipant(@Param("id") Long id, @Param("userId") Long userId);

    @Query("""
    select c from Conversation c
    where c.property.id = :propertyId and c.guest.id = :guestId and c.booking is null
  """)
    Optional<Conversation> findGeneral(@Param("propertyId") UUID propertyId,
                                       @Param("guestId") Long guestId);

    Optional<Conversation> findByBookingId(Long bookingId);

    @Query("""
    select count(m) from Message m
    where (m.conversation.owner.id = :userId or m.conversation.guest.id = :userId)
      and m.readAt is null
      and m.sender.id <> :userId
  """)
    long unreadCountForUser(@Param("userId") Long userId);

    /**
     * Inbox projection (paged) con campos de booking.
     */
    @Query(
            value = """
    select
      c.id                                                                 as id,
      c.property.id                                                         as propertyId,
      c.property.title                                                      as propertyTitle,
      (case when c.owner.id = :userId then c.guest.email else c.owner.email end)
                                                                            as otherUserEmail,
      c.lastMessagePreview                                                  as lastMessagePreview,
      c.lastMessageAt                                                       as lastMessageAt,
      (select count(m) from Message m
         where m.conversation = c
           and m.readAt is null
           and m.sender.id <> :userId)                                      as unreadCount,
      c.status                                                              as status,
      (case when c.booking is null then false else true end)                as hasBooking,
      c.property.coverUrl                                                   as propertyCoverUrl,

      b.id                                                                  as bookingId,
      b.checkIn                                                             as checkIn,
      b.checkOut                                                            as checkOut,
      b.status                                                              as bookingStatus,
      b.totalPrice                                                          as totalPrice,
      'EUR'                                                                 as currency
    from Conversation c
    left join c.booking b
    where c.owner.id = :userId or c.guest.id = :userId
    order by c.lastMessageAt desc nulls last, c.createdAt desc
  """,
            countQuery = """
    select count(c)
    from Conversation c
    where c.owner.id = :userId or c.guest.id = :userId
  """
    )
    @QueryHints(@QueryHint(name = HINT_READ_ONLY, value = "true"))
    Page<ConversationSummary> findSummariesForUser(@Param("userId") Long userId, Pageable pageable);
}
