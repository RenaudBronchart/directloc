package com.directloc.messaging;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Data access for conversation threads. */
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    /** Enforce single thread per (property, owner, guest). */
    Optional<Conversation> findByPropertyIdAndOwnerIdAndGuestId(UUID propertyId, Long ownerId, Long guestId);

    /** All threads where the user participates (as owner OR guest), newest first. */
    @Query("""
       select c from Conversation c
       where c.owner.id = :userId or c.guest.id = :userId
       order by c.lastMessageAt desc nulls last, c.createdAt desc
    """)
    List<Conversation> findAllForUser(@Param("userId") Long userId);

    /** Resolve a conversation ONLY if the given user is a participant. */
    @Query("""
       select c from Conversation c
       where c.id = :id and (c.owner.id = :userId or c.guest.id = :userId)
    """)
    Optional<Conversation> findByIdForParticipant(@Param("id") Long id, @Param("userId") Long userId);

    /**
     * Projection for the mailbox list with unread counters.
     * NOTE: unreadCount excludes messages sent by "me" and with readAt != null.
     */
    @Query("""
       select c.id as id,
              c.property.id as propertyId,
              c.property.title as propertyTitle,
              (case when c.owner.id = :userId then c.guest.email else c.owner.email end) as otherUserEmail,
              c.lastMessagePreview as lastMessagePreview,
              c.lastMessageAt as lastMessageAt,
              (select count(m) from Message m
                 where m.conversation = c
                   and m.readAt is null
                   and m.sender.id <> :userId) as unreadCount,
              c.status as status
       from Conversation c
       where c.owner.id = :userId or c.guest.id = :userId
       order by c.lastMessageAt desc nulls last, c.createdAt desc
    """)
    Page<ConversationSummary> findSummariesForUser(@Param("userId") Long userId, Pageable pageable);
}
