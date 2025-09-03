package com.directloc.property;

import com.directloc.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Domain entity for a property/listing.
 *
 * Notes:
 * - Adds rich attributes to support advanced search and filters.
 * - Keeps legacy 'location' but derives it from (city, region) if blank.
 * - Uses BigDecimal for money/distances; integers for counts.
 * - Auditing fields (createdAt/updatedAt) via Spring Data auditing.
 */
@Entity
@Table(
        name = "properties",
        indexes = {
                @Index(name = "idx_properties_location", columnList = "location"),
                @Index(name = "idx_properties_city",     columnList = "city"),
                @Index(name = "idx_properties_region",   columnList = "region"),
                @Index(name = "idx_properties_created_at", columnList = "created_at")
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"owner"})
public class Property {

    @Id
    @GeneratedValue
    @EqualsAndHashCode.Include
    private UUID id;

    /* ---------- Basic info ---------- */

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    /** Region and city are explicit fields used for search/faceting. */
    @Column(nullable = false, length = 120)
    private String region;     // e.g., "Gironde · France"

    @Column(nullable = false, length = 120)
    private String city;       // e.g., "Bordeaux"

    /**
     * Legacy free-form location used by existing screens.
     * Will be auto-derived from city + " · " + region if blank.
     */
    @Column(nullable = false)
    private String location;

    /* ---------- Pricing ---------- */

    /** Money field – mapped as NUMERIC(12,2) in DB. */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal pricePerNight;

    /** 3-letter ISO currency code; defaults to EUR on create. */
    @Column(nullable = false, length = 3)
    private String currency;

    /* ---------- Capacities ---------- */

    private Integer maxGuests;
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer beds;

    /** Area in square meters (optional). */
    private Integer areaM2;

    /* ---------- Types ---------- */

    @Enumerated(EnumType.STRING)
    @Column(length = 24)
    private PropertyType propertyType;

    @Enumerated(EnumType.STRING)
    @Column(length = 24)
    private ViewType viewType;

    /* ---------- Amenities / rules ---------- */

    private Boolean parking;
    private Boolean workspace;
    private Boolean pool;
    private Boolean terrace;

    private Boolean petFriendly;
    private Boolean airConditioning;
    private Boolean hotTub;
    private Boolean balcony;

    private Boolean smokingAllowed;
    private Boolean heating;
    private Boolean garden;
    private Boolean accessible;

    /** Wi-Fi speed in Mbps (optional). */
    private Integer wifiMbps;

    /** Minimum nights (optional). */
    private Integer minNights;

    /** Optional check-in / check-out time hints. */
    private LocalTime checkInFrom;
    private LocalTime checkOutUntil;

    /** Distances (km). */
    @Column(precision = 8, scale = 2)
    private BigDecimal distanceToBeachKm;

    @Column(precision = 8, scale = 2)
    private BigDecimal distanceToCenterKm;

    /* ---------- Media ---------- */

    private String coverUrl;

    /* ---------- Ownership / auditing ---------- */

    /** LAZY to avoid loading owner unless explicitly accessed. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @CreatedDate
    @Column(name = "created_at", updatable = false, nullable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    /* ---------- Lifecycle hooks ---------- */

    /**
     * Ensure we have:
     * - currency (defaults to "EUR"),
     * - a derived location if blank ("{city} · {region}"),
     * - a cover image if none is provided.
     */
    @PrePersist
    @PreUpdate
    public void ensureDerivedFields() {
        if (this.currency == null || this.currency.isBlank()) {
            this.currency = "EUR";
        }
        if ((this.location == null || this.location.isBlank())) {
            String c = (this.city != null && !this.city.isBlank()) ? this.city : null;
            String r = (this.region != null && !this.region.isBlank()) ? this.region : null;
            if (c != null && r != null) {
                this.location = c + " · " + r;
            } else if (c != null) {
                this.location = c;
            } else if (r != null) {
                this.location = r;
            } else {
                this.location = "Unknown";
            }
        }
        if (this.coverUrl == null || this.coverUrl.isBlank()) {
            String seed = (this.title != null && !this.title.isBlank()) ? this.title : "directloc";
            String encoded = URLEncoder.encode(seed, StandardCharsets.UTF_8);
            this.coverUrl = "https://picsum.photos/seed/" + encoded + "/1200/800";
        }
    }


}
