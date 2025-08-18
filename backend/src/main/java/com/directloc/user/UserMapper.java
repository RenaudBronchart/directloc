package com.directloc.user;

public class UserMapper {
    public static UserDto toDto(User u) {
        return new UserDto(u.getId(), u.getEmail(), u.getRole());
    }
}
