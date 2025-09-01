// com/directloc/userprofile/UserProfileDto.java
package com.directloc.userprofile;

/** Read-only DTO returned to the UI. */
public record ProfileDto(
        String email,
        String avatarUrl,
        String firstName,
        String lastName,
        String phone,
        String phoneCountry,          // ISO-2 (ES, FR, ...)
        PhoneVisibility phoneVisibility,
        Gender gender,                // MALE/FEMALE/OTHER
        String nationality,           // ISO-2
        String dateOfBirth,           // "yyyy-MM-dd"
        String locale,
        String timezone,
        Boolean wantsToHost
) {}
