package com.directloc.property;

import com.fasterxml.jackson.annotation.JsonInclude;
// If you ever need explicit date formatting, you can add @JsonFormat on fields.
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * API DTO returned to clients for a Property.
 *
 * Notes:
 * - We keep types aligned with the JPA entity so the mapping is trivial.
 * - @JsonInclude NON_NULL keeps the payload clean by omitting null fields.
 * - Instant is serialized as ISO-8601 by Spring Boot (jackson-datatype-jsr310).
 * - If you ever need to guarantee non-scientific BigDecimal, prefer global
 *   Jackson config or a custom serializer rather than per-field hacks.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@JsonInclude(JsonInclude.Include.NON_NULL) // optional: omit nulls from JSON
public class PropertyResponse {

    /** Stable public identifier (UUID). */
    private UUID id;

    /** Human-readable title (<= 255 chars). */
    private String title;

    /** Long description (<= 2000 chars). */
    private String description;

    /** City/area/country or free-form location string. */
    private String location;

    /** Nightly price (2 decimals). */
    private BigDecimal pricePerNight;

    /** Absolute URL to cover image. Auto-filled in entity if blank. */
    private String coverUrl;

    /** Optional attributes; may be null if not provided. */
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer maxGuests;

    /** Audit timestamps (ISO-8601). */
    private Instant createdAt;
    private Instant updatedAt;

    /** Owner’s email (PII). Expose only if product requires it. */
    private String ownerEmail;
}
