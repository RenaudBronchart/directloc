// src/main/java/com/directloc/user/Role.java
package com.directloc.user;

/**
 * Simple role model.
 * Spring Security expects "ROLE_..." in GrantedAuthority,
 * which we add in UserDetailsImpl.
 */
public enum Role {
    USER,
    ADMIN
}
