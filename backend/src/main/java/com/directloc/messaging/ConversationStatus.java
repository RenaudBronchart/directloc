package com.directloc.messaging;

/**
 * Conversation lifecycle status.
 * OPEN   - participants can exchange new messages.
 * CLOSED - read-only; no new messages allowed (can be re-opened later if you add that rule).
 */
public enum ConversationStatus {
    OPEN,        // active / visible
    ARCHIVED,    // hidden from main list; can be re-opened
    CLOSED       // terminal; cannot send
}
