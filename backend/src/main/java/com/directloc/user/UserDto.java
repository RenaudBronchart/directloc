// src/main/java/com/directloc/user/UserDto.java
package com.directloc.user;

/** Lightweight DTO returned to the client. */
public record UserDto(Long id, String email, Role role) {}
