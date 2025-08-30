package com.directloc.messaging;

import com.directloc.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

/**
 * A single message inside a conversation.
 * We keep sender for authorship and createdAt for chronological ordering.
 */
// com/directloc/messaging/Message.java
@Entity
@Table(name = "messages",
        indexes = @Index(name="idx_msg_conv_created", columnList = "conversation_id, created_at"))
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Message {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Conversation conversation;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private User sender;

    @Column(nullable = false, length = 2000)
    private String body;

    @CreatedDate
    @Column(name = "created_at", updatable = false, nullable = false)
    private Instant createdAt;

    /** Puede ser null hasta que el receptor lo lea */
    @Column(name = "read_at")
    private Instant readAt;
}

