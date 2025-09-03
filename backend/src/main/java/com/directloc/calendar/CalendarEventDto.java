// src/main/java/com/directloc/calendar/CalendarEventDto.java
package com.directloc.calendar;

import java.time.LocalDate;
import java.util.UUID;

public class CalendarEventDto {
    // Booking primary key (Long)
    private Long id;

    private String type;           // e.g. "BOOKING"
    private UUID propertyId;       // Property.id is UUID
    private String propertyTitle;

    private LocalDate start;       // check-in (inclusive)
    private LocalDate end;         // check-out (exclusive)
    private String status;         // REQUESTED / ACCEPTED / REJECTED / CANCELLED
    private Integer guests;        // adults + children

    public CalendarEventDto() {}

    public CalendarEventDto(Long id, String type, UUID propertyId, String propertyTitle,
                            LocalDate start, LocalDate end, String status, Integer guests) {
        this.id = id;
        this.type = type;
        this.propertyId = propertyId;
        this.propertyTitle = propertyTitle;
        this.start = start;
        this.end = end;
        this.status = status;
        this.guests = guests;
    }

    public Long getId() { return id; }
    public String getType() { return type; }
    public UUID getPropertyId() { return propertyId; }
    public String getPropertyTitle() { return propertyTitle; }
    public LocalDate getStart() { return start; }
    public LocalDate getEnd() { return end; }
    public String getStatus() { return status; }
    public Integer getGuests() { return guests; }

    public void setId(Long id) { this.id = id; }
    public void setType(String type) { this.type = type; }
    public void setPropertyId(UUID propertyId) { this.propertyId = propertyId; }
    public void setPropertyTitle(String propertyTitle) { this.propertyTitle = propertyTitle; }
    public void setStart(LocalDate start) { this.start = start; }
    public void setEnd(LocalDate end) { this.end = end; }
    public void setStatus(String status) { this.status = status; }
    public void setGuests(Integer guests) { this.guests = guests; }
}
