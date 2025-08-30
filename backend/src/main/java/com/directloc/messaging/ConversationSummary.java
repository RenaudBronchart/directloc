// src/main/java/com/directloc/messaging/ConversationSummary.java
package com.directloc.messaging;

import java.time.Instant;
import java.util.UUID;

/** Lightweight projection to render the thread list quickly. */
public interface ConversationSummary {
    Long getId();
    UUID getPropertyId();
    String getPropertyTitle();
    String getOtherUserEmail();
    String getLastMessagePreview();
    Instant getLastMessageAt();
    long getUnreadCount();
    ConversationStatus getStatus();
}
