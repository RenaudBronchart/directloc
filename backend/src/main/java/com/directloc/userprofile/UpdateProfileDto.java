package com.directloc.userprofile;

import jakarta.validation.constraints.Size;

/** Partial update received from the UI. Email is server-managed. */
public record UpdateProfileDto(
        @Size(max = 120) String fullName,
        @Size(max = 40)  String phone,
        @Size(max = 2)   String phoneCountry,     // ISO-2

        PhoneVisibility  phoneVisibility,
        Gender           gender,
        @Size(max = 2)   String nationality,      // ISO-2
        String           dateOfBirth,             // "yyyy-MM-dd"

        Boolean          wantsToHost,

        @Size(max = 16)  String locale,
        @Size(max = 64)  String timezone,
        Boolean          marketingOptIn
) {}
