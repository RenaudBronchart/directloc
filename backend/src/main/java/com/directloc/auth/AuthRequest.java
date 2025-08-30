// src/main/java/com/directloc/auth/AuthRequest.java
package com.directloc.auth;

import lombok.*;

// NOTE: Minimal request DTO used for login.
// TIP (optional): add validation annotations (@Email, @NotBlank) if you want 400 on invalid input.
// Keeping as-is to avoid breaking existing flows.
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AuthRequest {
    private String email;
    private String password;
}
