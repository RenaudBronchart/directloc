// com/directloc/userprofile/UserProfile.java
package com.directloc.userprofile;

import com.directloc.user.User;
import jakarta.persistence.*;
import lombok.*;

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

    // Basic public-ish info (extend later as needed)
    private String firstName;
    private String lastName;
    private String avatarUrl;

    // Contact
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PhoneVisibility phoneVisibility; // NEVER / AFTER_ACCEPT / ALWAYS_FOR_HOSTS

    // Preferences (optional)
    private String locale;
    private String timezone;
    private Boolean marketingOptIn;
}
