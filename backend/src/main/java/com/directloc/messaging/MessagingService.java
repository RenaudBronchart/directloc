package com.directloc.messaging;

import com.directloc.booking.Booking;
import com.directloc.booking.BookingRepository;
import com.directloc.property.Property;
import com.directloc.property.PropertyRepository;
import com.directloc.user.User;
import com.directloc.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessagingService {

    private final ConversationRepository convRepo;
    private final MessageRepository msgRepo;
    private final PropertyRepository propertyRepo;
    private final BookingRepository bookingRepo;
    private final UserService userService;

    private User me() { return userService.getCurrentUser(); }

    /** Open (or reuse) GENERAL conversation (booking = null). */
    @Transactional
    public Conversation openGeneral(UUID propertyId) {
        var me = me();
        Property property = propertyRepo.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        var owner = property.getOwner();
        if (owner.getId().equals(me.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Owner cannot chat with self.");
        }

        return convRepo.findGeneral(propertyId, me.getId())
                .orElseGet(() -> convRepo.save(Conversation.builder()
                        .property(property)
                        .booking(null)
                        .owner(owner)
                        .guest(me)
                        .status(ConversationStatus.OPEN)
                        .lastMessageAt(Instant.now())
                        .build()));
    }

    /** Open (or reuse) BOOKING conversation (one per booking). */
    @Transactional
    public Conversation openForBooking(Long bookingId) {
        var me = me();
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        var property = booking.getProperty();
        var owner = property.getOwner();
        var guest = booking.getGuest();

        // Only participants may open
        if (!me.getId().equals(owner.getId()) && !me.getId().equals(guest.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a participant of this booking.");
        }

        return convRepo.findByBookingId(bookingId)
                .orElseGet(() -> convRepo.save(Conversation.builder()
                        .property(property)
                        .booking(booking)
                        .owner(owner)
                        .guest(guest)
                        .status(ConversationStatus.OPEN)
                        .lastMessageAt(Instant.now())
                        .build()));
    }

    /** Send a message inside a conversation; only participants can send. */
    @Transactional
    public Message send(Long conversationId, String body) {
        if (body == null || body.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message body is required.");

        var me = me();
        var conv = convRepo.findByIdForParticipant(conversationId, me.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a participant"));

        if (conv.getStatus() == ConversationStatus.CLOSED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Conversation is closed.");
        }
        if (conv.getStatus() == ConversationStatus.ARCHIVED) {
            conv.setStatus(ConversationStatus.OPEN);
        }

        var msg = msgRepo.save(Message.builder()
                .conversation(conv)
                .sender(me)
                .body(body.trim())
                .createdAt(Instant.now())
                .build());

        conv.setLastMessageAt(msg.getCreatedAt());
        conv.setLastMessagePreview(body.length() > 120 ? body.substring(0, 120) + "…" : body);
        convRepo.save(conv);

        return msg;
    }

    /** List conversation summaries for the current user. */
    @Transactional(readOnly = true)
    public Page<ConversationSummary> listMyConversations(Pageable pageable) {
        return convRepo.findSummariesForUser(me().getId(), pageable);
    }

    /** List messages in a conversation (ASC). */
    @Transactional(readOnly = true)
    public Page<Message> listMessages(Long conversationId, Pageable pageable) {
        var conv = convRepo.findByIdForParticipant(conversationId, me().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a participant"));
        return msgRepo.findByConversationOrderByCreatedAtAsc(conv, pageable);
    }

    /** Mark all messages from the other user as read now. */
    @Transactional
    public void markRead(Long conversationId) {
        var me = me();
        var conv = convRepo.findByIdForParticipant(conversationId, me.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a participant"));

        msgRepo.findByConversationOrderByCreatedAtAsc(conv, Pageable.unpaged())
                .stream()
                .filter(m -> m.getReadAt() == null && !m.getSender().getId().equals(me.getId()))
                .forEach(m -> m.setReadAt(Instant.now()));
    }

    @Transactional
    public Conversation archive(Long conversationId) {
        var conv = convRepo.findByIdForParticipant(conversationId, me().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a participant"));
        conv.setStatus(ConversationStatus.ARCHIVED);
        return convRepo.save(conv);
    }

    @Transactional
    public Conversation unarchive(Long conversationId) {
        var conv = convRepo.findByIdForParticipant(conversationId, me().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a participant"));
        conv.setStatus(ConversationStatus.OPEN);
        return convRepo.save(conv);
    }
}
