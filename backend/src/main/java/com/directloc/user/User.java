// src/main/java/com/directloc/user/User.java
package com.directloc.user;

import jakarta.persistence.*;
import lombok.*;

/**
 * User entity.
 * - Email unique.
 * - BCrypt-hashed password.
 * - Role used for authorization decisions.
 */
@Entity
@Table(
        name = "users",
        uniqueConstraints = { @UniqueConstraint(columnNames = "email") }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;
}
