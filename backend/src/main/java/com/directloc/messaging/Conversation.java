package com.directloc.messaging;

import com.directloc.property.Property;
import com.directloc.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

/**
 * 1:1 thread between a property owner (host) and a guest for a given property.
 * Uniqueness is (property, owner, guest) → avoids duplicates.
 */
@Entity
@Table(name = "conversations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"property_id","owner_id","guest_id"}),
        indexes = {
                @Index(name="idx_conv_property", columnList = "property_id"),
                @Index(name="idx_conv_owner", columnList = "owner_id"),
                @Index(name="idx_conv_guest", columnList = "guest_id"),
                @Index(name="idx_conv_lastmsg", columnList = "lastMessageAt")
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EntityListeners(AuditingEntityListener.class)
public class Conversation {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Property the thread refers to. */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Property property;

    /** Property owner (host). */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    /** Guest who contacted the owner. */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id")
    private User guest;

    /** OPEN / ARCHIVED / CLOSED. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConversationStatus status;

    /** Seen markers for unread counters (per participant). */
    private Instant ownerLastSeenAt;
    private Instant guestLastSeenAt;

    /** Last message timestamp (used for ordering thread lists). */
    private Instant lastMessageAt;

    /** Small snippet of the last message (for list preview). */
    @Column(length = 200)
    private String lastMessagePreview;

    @CreatedDate @Column(updatable = false, nullable = false)
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
