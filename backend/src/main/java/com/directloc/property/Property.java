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

@Entity
@Table(name = "properties", indexes = {
        @Index(name = "idx_properties_location", columnList = "location")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Property {

    @Id @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false)
    private BigDecimal pricePerNight;

    @Column(nullable = false)
    private String location;

    //
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer maxGuests;

    //
    private String coverUrl;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @CreatedDate
    @Column(name = "created_at", updatable = false, nullable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

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
