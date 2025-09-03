// src/main/java/com/directloc/messaging/MessagingMapper.java
package com.directloc.messaging;

import com.directloc.user.User;
import com.directloc.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Helpers to map domain → DTOs. Stateless; uses UserService for "me". */
@Component
@RequiredArgsConstructor
public class MessagingMapper {

    private static final String DEFAULT_CURRENCY = "EUR";

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

    /** Map Conversation entity → DTO (includes unread count for current user). */
    public ConversationSummaryDto toSummaryDto(Conversation c) {
        User me = userService.getCurrentUser();

        long unread = messageRepository.countUnreadForUser(c.getId(), me.getId());

        String other = c.getOwner().getId().equals(me.getId())
                ? c.getGuest().getEmail()
                : c.getOwner().getEmail();

        boolean hasBooking = c.getBooking() != null;

        // Property cover image URL (ajusta si tu Property tiene otro getter)
        String coverUrl = null;
        // coverUrl = c.getProperty().getCoverImageUrl();
        // coverUrl = c.getProperty().getMainImageUrl();

        // ----- Campos de booking (opcionales) -----
        Long        bookingId     = null;
        LocalDate   checkIn       = null;
        LocalDate   checkOut      = null;
        String      bookingStatus = null;
        BigDecimal  totalPrice    = null;
        String      currency      = DEFAULT_CURRENCY; // 👈 fijo a EUR

        if (c.getBooking() != null) {
            var b = c.getBooking();
            bookingId = b.getId();
            // Ajusta a tus getters reales de Booking
            checkIn = b.getCheckIn();
            checkOut = b.getCheckOut();
            bookingStatus = b.getStatus() != null ? b.getStatus().name() : null;
            totalPrice = b.getTotalPrice();
            // NO llames a b.getCurrency(); no existe en Booking
            // currency se queda en DEFAULT_CURRENCY
        }

        return new ConversationSummaryDto(
                c.getId(),
                c.getProperty().getId(),
                c.getProperty().getTitle(),
                other,
                c.getLastMessagePreview(),
                c.getLastMessageAt(),
                unread,
                c.getStatus(),
                hasBooking,
                coverUrl,
                // nuevos 6 campos
                bookingId,
                checkIn,
                checkOut,
                bookingStatus,
                totalPrice,
                currency
        );
    }

    /**
     * Si usas proyección (ConversationSummary) con query custom:
     * - Si tu proyección YA tiene getCurrency(): usamos ese valor o EUR por defecto.
     * - Si NO la has ampliado, puedes devolver siempre EUR aquí también.
     */
    public ConversationSummaryDto fromProjection(ConversationSummary p) {
        // Si tu interfaz ConversationSummary incluye getCurrency(), usa:
        String currency = DEFAULT_CURRENCY;
        try {
            // Puede venir null si la query no lo selecciona; fallback a EUR
            String projected = p.getCurrency();
            if (projected != null && !projected.isBlank()) currency = projected;
        } catch (Throwable ignored) {
            // Si la proyección no tiene getCurrency() aún, mantenemos EUR
        }

        return new ConversationSummaryDto(
                p.getId(),
                p.getPropertyId(),
                p.getPropertyTitle(),
                p.getOtherUserEmail(),
                p.getLastMessagePreview(),
                p.getLastMessageAt(),
                p.getUnreadCount(),
                p.getStatus(),
                Boolean.TRUE.equals(p.getHasBooking()),
                p.getPropertyCoverUrl(),
                p.getBookingId(),
                p.getCheckIn(),
                p.getCheckOut(),
                p.getBookingStatus() != null ? p.getBookingStatus().name() : null,
                p.getTotalPrice(),
                currency
        );
    }
}
