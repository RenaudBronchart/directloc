// src/main/java/com/directloc/booking/Booking.java
package com.directloc.booking;

import com.directloc.property.Property;
import com.directloc.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Booking aggregate.
 *
 * Key notes:
 * - We store check-in/out as LocalDate (midnight boundaries) and calculate nights in service layer.
 * - totalPrice is the quoted/estimated price (no payments on platform).
 * - status is a workflow flag (REQUESTED/ACCEPTED/DECLINED/CANCELLED/EXPIRED).
 * - Auditing fields require @EnableJpaAuditing in a Spring config.
 */
@Entity
@Table(
        name = "bookings",
        indexes = {
                // Helpful indexes for search/filtering:
                @Index(name = "idx_booking_property", columnList = "property_id"),
                @Index(name = "idx_booking_guest", columnList = "guest_id"),
                // Use physical column names for date range queries:
                @Index(name = "idx_booking_dates", columnList = "check_in,check_out")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Property being booked  */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    /** Guest user who made the booking request. */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id", nullable = false)
    private User guest;

    /** Check-in date (inclusive). */
    @Column(name = "check_in", nullable = false)
    private LocalDate checkIn;

    /** Check-out date (exclusive). */
    @Column(name = "check_out", nullable = false)
    private LocalDate checkOut;

    /** Party composition; nullable to keep payloads minimal (mapper sets safe defaults). */
    private Integer adults;
    private Integer children;
    private Integer rooms;

    /**
     * Quoted total price for the stay (nights * pricePerNight).
     * Precision chosen to be safe for EUR-like currencies.
     */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;

    /**
     * Workflow status. Suggested values:
     *  - REQUESTED: created by guest, pending host.
     *  - ACCEPTED: approved by host, dates are blocked.
     *  - DECLINED: rejected by host.
     *  - CANCELLED: cancelled by guest (or host policy), see service rules.
     *  - EXPIRED: (optional) host didn’t decide on time.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    /** Auditing: created at (UTC instant). */
    @CreatedDate
    @Column(updatable = false)
    private Instant createdAt;

    /** Auditing: last updated at (UTC instant). */
    @LastModifiedDate
    private Instant updatedAt;

    // If you ever need JPA-level defaulting (e.g., status=REQUESTED), you can add:
    // @PrePersist
    // void prePersist() {
    //     if (status == null) status = BookingStatus.REQUESTED;
    // }
}
