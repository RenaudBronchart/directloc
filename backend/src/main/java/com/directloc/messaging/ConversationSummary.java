// src/main/java/com/directloc/messaging/ConversationSummary.java
package com.directloc.messaging;

import com.directloc.booking.BookingStatus; // <-- ajusta el paquete
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public interface ConversationSummary {
    Long getId();
    UUID getPropertyId();
    String getPropertyTitle();
    String getOtherUserEmail();
    String getLastMessagePreview();
    Instant getLastMessageAt();
    long getUnreadCount();
    ConversationStatus getStatus();
    Boolean getHasBooking();
    String getPropertyCoverUrl();

    Long getBookingId();
    LocalDate getCheckIn();
    LocalDate getCheckOut();
    BookingStatus getBookingStatus();   // <-- enum, no String
    BigDecimal getTotalPrice();
    String getCurrency();
}
