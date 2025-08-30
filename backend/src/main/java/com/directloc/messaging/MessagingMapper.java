package com.directloc.messaging;

import com.directloc.user.User;
import com.directloc.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** Helpers to map domain → DTOs. Stateless; uses UserService for "me". */
@Component
@RequiredArgsConstructor
public class MessagingMapper {

    private final UserService userService;
    private final MessageRepository messageRepository;

    /** Map Message → MessageDto (computes "mine" with current user). */
    public MessageDto toDto(Message m) {
        User me = userService.getCurrentUser();
        boolean mine = m.getSender() != null
                && m.getSender().getId() != null
                && m.getSender().getId().equals(me.getId());
        return new MessageDto(
                m.getId(),
                m.getSender() != null ? m.getSender().getEmail() : null,
                m.getBody(),
                m.getCreatedAt(),
                mine
        );
    }

    /** Map Conversation → Summary DTO including unread count for current user. */
    public ConversationSummaryDto toSummaryDto(Conversation c) {
        User me = userService.getCurrentUser();
        long unread = messageRepository.countUnreadForUser(c.getId(), me.getId());
        String other = c.getOwner().getId().equals(me.getId())
                ? c.getGuest().getEmail()
                : c.getOwner().getEmail();
        return new ConversationSummaryDto(
                c.getId(),
                c.getProperty().getId(),
                c.getProperty().getTitle(),
                other,
                c.getLastMessagePreview(),
                c.getLastMessageAt(),
                unread,
                c.getStatus()
        );
    }

    public ConversationSummaryDto fromProjection(ConversationSummary p) {
        return new ConversationSummaryDto(
                p.getId(),
                p.getPropertyId(),
                p.getPropertyTitle(),
                p.getOtherUserEmail(),
                p.getLastMessagePreview(),
                p.getLastMessageAt(),
                p.getUnreadCount(),
                p.getStatus()
        );
    }
}
