// src/main/java/com/directloc/user/UserMapper.java
package com.directloc.user;

/** Simple mapper from entity to DTO. */
public class UserMapper {
    public static UserDto toDto(User u) {
        return new UserDto(u.getId(), u.getEmail(), u.getRole());
    }
}
