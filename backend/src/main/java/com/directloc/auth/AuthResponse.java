// src/main/java/com/directloc/auth/AuthResponse.java
package com.directloc.auth;

import lombok.*;

// Minimal response for auth endpoints: currently only JWT token.
// TIP (optional): you can include a UserDto here later to avoid an extra /me call.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
}
