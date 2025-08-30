package com.directloc.messaging;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface MessageRepository extends JpaRepository<Message, Long> {

    /** Paged read of messages in chronological order. */
    Page<Message> findByConversationOrderByCreatedAtAsc(Conversation conversation, Pageable pageable);

    /** Count unread messages for a user in a conversation. */
    @Query("""
      select count(m) from Message m
      where m.conversation.id = :convId
        and m.readAt is null
        and m.sender.id <> :userId
      """)
    long countUnreadForUser(@Param("convId") Long conversationId,
                            @Param("userId") Long userId);
}
