// src/main/java/com/directloc/auth/RegisterRequest.java
package com.directloc.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Registration payload.
 * You can extend this later (e.g., name, phone, host/guest onboarding flags, etc.).
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class RegisterRequest {

    @Email(message = "Email must be valid")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
