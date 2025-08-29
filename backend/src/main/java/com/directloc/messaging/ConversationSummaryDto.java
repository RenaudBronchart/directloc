package com.directloc.messaging;

import java.time.Instant;
import java.util.UUID;

/** Full summary DTO for a single thread row (if no projection is used). */
public record ConversationSummaryDto(
        Long id,
        UUID propertyId,
        String propertyTitle,
        String otherUserEmail,
        String lastMessagePreview,
        Instant lastMessageAt,
        long unreadCount,
        ConversationStatus status
) {}
