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
import java.util.UUID;

/**
 * Domain entity for a property/listing.
 *
 * Notes:
 * - Uses BigDecimal with precision/scale for money.
 * - LAZY owner association to avoid loading user graph unless needed.
 * - Auditing fields (createdAt/updatedAt) filled by Spring Data auditing.
 * - Simple coverUrl fallback using picsum + title as seed.
 * - Equals/HashCode only on id to prevent accidental graph traversal.
 */
@Entity
@Table(
        name = "properties",
        indexes = {
                @Index(name = "idx_properties_location", columnList = "location"),
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

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    /** Money field – mapped as NUMERIC(12,2) in DB */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal pricePerNight;

    @Column(nullable = false)
    private String location;

    // Optional attributes (can be null)
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer maxGuests;

    private String coverUrl;

    /** LAZY to avoid loading owner unless explicitly accessed */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @CreatedDate
    @Column(name = "created_at", updatable = false, nullable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    /**
     * Ensure we always have a cover image:
     * if the field is empty, generate a picsum URL seeded by the title.
     */
    @PrePersist
    @PreUpdate
    public void ensureCoverUrl() {
        if (this.coverUrl == null || this.coverUrl.isBlank()) {
            String seed = (this.title != null && !this.title.isBlank()) ? this.title : "directloc";
            String encoded = URLEncoder.encode(seed, StandardCharsets.UTF_8);
            this.coverUrl = "https://picsum.photos/seed/" + encoded + "/1200/800";
        }
    }
}
