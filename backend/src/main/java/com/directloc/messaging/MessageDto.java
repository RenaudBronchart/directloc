package com.directloc.messaging;

import java.time.Instant;

/**
 * Message view model for UI. "mine" allows quick alignment in chat bubbles.
 */
public record MessageDto(
        Long id,
        String senderEmail,
        String body,
        Instant createdAt,
        boolean mine
) {}
