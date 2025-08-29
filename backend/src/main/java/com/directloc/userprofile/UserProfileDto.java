// com/directloc/userprofile/UserProfileDto.java
package com.directloc.userprofile;

public record UserProfileDto(
        String firstName,
        String lastName,
        String avatarUrl,
        String phone,
        PhoneVisibility phoneVisibility,
        String locale,
        String timezone,
        Boolean marketingOptIn
) {}
