// src/main/java/com/directloc/userprofile/UserProfile.java
package com.directloc.userprofile;

import com.directloc.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "user_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserProfile {

    @Id
    private Long id; // same as user.id

    @OneToOne(optional = false)
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    // Public-ish profile
    @Column(length = 120)
    private String firstName;

    @Column(length = 120)
    private String lastName;

    @Column(length = 512)
    private String avatarUrl;

    // Contact
    @Column(length = 40)
    private String phone;
    private String phoneCountry;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PhoneVisibility phoneVisibility; // NEVER / AFTER_ACCEPT / ALWAYS_FOR_HOSTS

    // NUEVO
    @Enumerated(EnumType.STRING)
    private Gender gender;           // MALE/FEMALE/OTHER

    private String nationality;      // ISO-2 (ES, FR, ...)
    private LocalDate dateOfBirth;   // yyyy-MM-dd

    // Preferences (optional)
    @Column(length = 16)
    private String locale;

    @Column(length = 64)
    private String timezone;


    private Boolean wantsToHost;

    @PrePersist
    public void prePersist() {
        if (phoneVisibility == null) phoneVisibility = PhoneVisibility.NEVER;
    }
}
