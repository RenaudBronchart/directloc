// com/directloc/userprofile/UserProfileMapper.java
package com.directloc.userprofile;

public class UserProfileMapper {
    public static UserProfileDto toDto(UserProfile p) {
        if (p == null) return null;
        return new UserProfileDto(
                p.getFirstName(), p.getLastName(), p.getAvatarUrl(),
                p.getPhone(), p.getPhoneVisibility(),
                p.getLocale(), p.getTimezone(), p.getMarketingOptIn()
        );
    }

    public static void apply(UserProfile p, UserProfileDto dto) {
        p.setFirstName(dto.firstName());
        p.setLastName(dto.lastName());
        p.setAvatarUrl(dto.avatarUrl());
        p.setPhone(dto.phone());
        p.setPhoneVisibility(dto.phoneVisibility() == null ? PhoneVisibility.NEVER : dto.phoneVisibility());
        p.setLocale(dto.locale());
        p.setTimezone(dto.timezone());
        p.setMarketingOptIn(dto.marketingOptIn());
    }
}
