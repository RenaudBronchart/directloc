package com.directloc.messaging;

import java.time.Instant;
import java.util.UUID;

/** Lightweight projection to render the thread list quickly. */
public interface ConversationSummary {
    Long id();
    UUID propertyId();
    String propertyTitle();
    String otherUserEmail();
    String lastMessagePreview();
    Instant lastMessageAt();
    long unreadCount();
    ConversationStatus status();
}
